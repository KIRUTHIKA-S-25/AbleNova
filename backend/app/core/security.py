import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import bcrypt
from jose import ExpiredSignatureError, JWTError, jwt
from app.core.config import settings

logger = logging.getLogger("ablenova.security")

# In-memory tracking for failed login attempts (Rate-limiting against brute force)
_failed_login_attempts: Dict[str, Dict[str, Any]] = {}


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
        # Verify token type
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
        # Verify token type
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
# Rate Limiting & Account Lockout Guard
# ==============================================================================

def is_account_locked(identifier: str) -> bool:
    """Checks whether an account/email has exceeded maximum failed login attempts."""
    clean_id = identifier.lower().strip()
    record = _failed_login_attempts.get(clean_id)
    if not record:
        return False

    attempts = record.get("attempts", 0)
    lockout_time = record.get("lockout_time")

    if attempts >= settings.AUTH_MAX_FAILED_LOGIN_ATTEMPTS:
        if lockout_time:
            # Check if cooldown has elapsed
            if datetime.now(timezone.utc) < lockout_time:
                return True
            else:
                # Cooldown expired; reset lockout
                reset_failed_logins(clean_id)
                return False
        return True
    return False


def record_failed_login(identifier: str) -> None:
    """Increments the failed login attempt counter for an identifier."""
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
    """Clears failed login attempt tracking upon successful authentication."""
    clean_id = identifier.lower().strip()
    _failed_login_attempts.pop(clean_id, None)
