import hashlib
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import bcrypt
from jose import ExpiredSignatureError, JWTError, jwt
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models.user import FailedLoginAttempt, RefreshToken

logger = logging.getLogger("ablenova.security")


def hash_token(token: str) -> str:
    """Computes a SHA-256 hex digest for persistent token storage and lookup."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the hashed password safely."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt with salt."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None
) -> str:
    """Create a signed JWT access token.
    Token type claim 'type': 'access' prevents misuse as a refresh token.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "jti": str(uuid.uuid4()),
        "type": "access",
    }
    if extra_claims:
        to_encode.update(extra_claims)

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )


def create_refresh_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create a signed JWT refresh token with extended lifecycle.
    Token type claim 'type': 'refresh' prevents misuse on protected API endpoints.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "jti": str(uuid.uuid4()),
        "type": "refresh",
    }

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate an access token.
    Rejects tokens that have expired, have invalid signatures, or are not of type 'access'.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "access":
            logger.warning("Token rejected: incorrect token type '%s' for access endpoint", payload.get("type"))
            return None
        return payload
    except ExpiredSignatureError:
        logger.debug("Access token expired")
        return None
    except JWTError as exc:
        logger.debug("Access token decode error: %s", type(exc).__name__)
        return None


def decode_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a refresh token.
    Rejects tokens that have expired, have invalid signatures, or are not of type 'refresh'.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "refresh":
            logger.warning("Token rejected: incorrect token type '%s' for refresh endpoint", payload.get("type"))
            return None
        return payload
    except ExpiredSignatureError:
        logger.debug("Refresh token expired")
        return None
    except JWTError as exc:
        logger.debug("Refresh token decode error: %s", type(exc).__name__)
        return None


# ==============================================================================
# Persistent Refresh Token Tracking & Revocation
# ==============================================================================

def store_refresh_token(
    db: Session,
    user_id: uuid.UUID,
    raw_token: str,
    payload: Dict[str, Any],
) -> RefreshToken:
    """Stores only the SHA-256 hash of the refresh token in the database for tracking."""
    token_h = hash_token(raw_token)
    jti = payload.get("jti") or str(uuid.uuid4())
    exp_ts = payload.get("exp")
    if exp_ts:
        expires_at = datetime.fromtimestamp(exp_ts, tz=timezone.utc)
    else:
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    record = RefreshToken(
        id=uuid.uuid4(),
        user_id=user_id,
        token_hash=token_h,
        jti=jti,
        revoked=False,
        expires_at=expires_at,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_refresh_token_record(
    db: Session,
    raw_token: str,
) -> Optional[RefreshToken]:
    """Retrieves a refresh token database record by hashing the raw token."""
    token_h = hash_token(raw_token)
    return db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_h)
    ).scalar_one_or_none()


def revoke_refresh_token_by_hash(
    db: Session,
    token_hash: str,
) -> Optional[RefreshToken]:
    """Revokes a specific refresh token by its SHA-256 hash."""
    record = db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    ).scalar_one_or_none()
    if record and not record.revoked:
        record.revoked = True
        record.revoked_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(record)
    return record


def revoke_all_user_refresh_tokens(
    db: Session,
    user_id: uuid.UUID,
) -> int:
    """Revokes all active refresh tokens for a user (used on logout or token reuse detection)."""
    now = datetime.now(timezone.utc)
    records = db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False,
        )
    ).scalars().all()
    for r in records:
        r.revoked = True
        r.revoked_at = now
    db.commit()
    return len(records)


# ==============================================================================
# Persistent Rate Limiting (Multi-worker & Distributed Safe)
# ==============================================================================

def is_login_rate_limited(db: Session, identifier: str) -> bool:
    """Checks if an identifier has exceeded maximum failed login attempts within window.
    Operates on database storage to ensure consistency across multiple workers and restarts.
    """
    clean_id = identifier.lower().strip()
    window_start = datetime.now(timezone.utc) - timedelta(minutes=settings.AUTH_LOCKOUT_MINUTES)
    count = db.execute(
        select(func.count(FailedLoginAttempt.id)).where(
            FailedLoginAttempt.identifier == clean_id,
            FailedLoginAttempt.attempted_at >= window_start,
        )
    ).scalar() or 0
    return count >= settings.AUTH_MAX_FAILED_LOGIN_ATTEMPTS


def record_failed_login_attempt(
    db: Session,
    identifier: str,
    ip_address: Optional[str] = None,
) -> None:
    """Records a failed authentication attempt in the shared database."""
    clean_id = identifier.lower().strip()
    attempt = FailedLoginAttempt(
        id=uuid.uuid4(),
        identifier=clean_id,
        ip_address=ip_address,
        attempted_at=datetime.now(timezone.utc),
    )
    db.add(attempt)
    db.commit()


def reset_failed_login_attempts(db: Session, identifier: str) -> None:
    """Clears all failed login attempts for an identifier upon successful authentication."""
    clean_id = identifier.lower().strip()
    db.execute(
        delete(FailedLoginAttempt).where(FailedLoginAttempt.identifier == clean_id)
    )
    db.commit()


# ==============================================================================
# In-Memory Rate Limiting Fallback (DEVELOPMENT & TEST USE ONLY)
# ==============================================================================
# LIMITATIONS:
# 1. Process Isolation: Does not share state across multiple worker processes (e.g. uvicorn --workers 4).
# 2. Ephemeral: Wiped on application restart or container scaling.
# 3. Not Distributed: Cannot synchronize across multi-instance or serverless deployments.
# The database-backed methods above (FailedLoginAttempt) are used for reliable multi-worker rate limiting.

_failed_login_attempts: Dict[str, Dict[str, Any]] = {}


def is_account_locked(identifier: str) -> bool:
    """Development fallback: Checks if in-memory failed login counter exceeded limit."""
    clean_id = identifier.lower().strip()
    record = _failed_login_attempts.get(clean_id)
    if not record:
        return False

    attempts = record.get("attempts", 0)
    lockout_time = record.get("lockout_time")

    if attempts >= settings.AUTH_MAX_FAILED_LOGIN_ATTEMPTS:
        if lockout_time:
            if datetime.now(timezone.utc) < lockout_time:
                return True
            else:
                reset_failed_logins(clean_id)
                return False
        return True
    return False


def record_failed_login(identifier: str) -> None:
    """Development fallback: Increments in-memory failed login attempt counter."""
    clean_id = identifier.lower().strip()
    now = datetime.now(timezone.utc)
    record = _failed_login_attempts.get(clean_id)

    if not record:
        _failed_login_attempts[clean_id] = {
            "attempts": 1,
            "first_failed": now,
            "lockout_time": None,
        }
    else:
        record["attempts"] += 1
        if record["attempts"] >= settings.AUTH_MAX_FAILED_LOGIN_ATTEMPTS:
            record["lockout_time"] = now + timedelta(minutes=settings.AUTH_LOCKOUT_MINUTES)
            logger.warning("Account '%s' temporarily locked due to excessive failed logins", clean_id)


def reset_failed_logins(identifier: str) -> None:
    """Development fallback: Clears in-memory failed login tracking."""
    clean_id = identifier.lower().strip()
    _failed_login_attempts.pop(clean_id, None)
