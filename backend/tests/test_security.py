from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
)


def test_password_hashing():
    password = "SuperSecurePassword123"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_creation_and_decoding():
    user_id = "user_test_123"
    token = create_access_token(
        subject=user_id,
        extra_claims={"role": "student"}
    )
    assert isinstance(token, str)

    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == user_id
    assert payload.get("role") == "student"


def test_jwt_invalid_token():
    invalid_token = "invalid.token.string"
    payload = decode_access_token(invalid_token)
    assert payload is None
