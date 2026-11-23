# AbleNova Authentication & Role-Based Authorization Architecture

## 1. Authentication Architecture Decision

AbleNova implements **Application-Managed JWT Authentication** using HMAC-SHA256 (`HS256`) and `bcrypt` password hashing, backed by persistent token tracking and distributed rate limiting in the PostgreSQL database.

### Decision Rationale:
- **Consistency with API Contract**: Directly fulfills `docs/API_CONTRACT.md` Section 2 ("Authentication") and `docs/ARCHITECTURE.md` Section 6 ("Security Architecture").
- **Offline & Edge Capability**: AbleNova operates in low-connectivity and rural/remote environments. Application-managed JWT tokens enable decoupled validation and edge synchronization without synchronous round-trips to external third-party identity providers.
- **Single Source of Truth**: User accounts, credentials, refresh token hashes, failed login audit trails, and role models reside in the internal database schema, avoiding multi-system sync issues or vendor lock-in.

---

## 2. Public Registration Role Policy & Escalation Prevention

To prevent unauthorized privilege escalation, the public registration endpoint (`POST /api/v1/auth/register`) enforces the principle of least privilege:

1. **Strictly Student-Only**: Public self-registration is permitted exclusively for student accounts.
2. **Explicit Rejection of Privileged Roles**: If a client supplies `"role": "teacher"`, `"role": "caregiver"`, or `"role": "admin"`, the request is immediately rejected with `400 Bad Request` (`ROLE_NOT_PERMITTED`).
3. **Server-Side Role Assignment**: Regardless of any client-supplied role or fallback default, the server strictly hardcodes `role = "student"` upon record creation. Client-supplied role inputs are never trusted for authorization.
4. **Automatic Student Provisioning**: Registration automatically provisions a `Student` record and an accompanying `AccessibilityProfile` with safe defaults. Privileged profiles (`Teacher`, `Caregiver`) are never instantiated via public registration.

### Trusted Teacher and Caregiver Provisioning Workflow
Teacher and caregiver accounts have access to sensitive educational and personal data of children. They must be onboarded through a trusted workflow:
- **Administrative Provisioning**: An administrator creates the institutional profile and links educator credentials.
- **Verified Invitation & Onboarding**: Institutional administrators send signed single-use invitation tokens to verified school or guardian email addresses.
- **Verification Gate**: The onboarding endpoint verifies the institutional invitation token, activates the account, and establishes verified linkages in `teacher_students` or `caregiver_students`.

---

## 3. Token Lifecycle, Rotation & Revocation

All authentication tokens are issued as JSON Web Tokens signed with `JWT_SECRET` using `HS256`.

| Attribute | Access Token | Refresh Token |
| :--- | :--- | :--- |
| **Claim Type (`type`)** | `"access"` | `"refresh"` |
| **Subject (`sub`)** | User ID (`UUID` as string) | User ID (`UUID` as string) |
| **Role Claim (`role`)** | `"student" \| "teacher" \| "caregiver" \| "admin"` | N/A |
| **Default Lifespan** | **30 minutes** (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`) | **7 days** (configurable via `REFRESH_TOKEN_EXPIRE_DAYS`) |
| **Storage in DB** | Stateless (validated via signature & claims) | **Persistent SHA-256 Hash** in `refresh_tokens` table |
| **Usage** | Sent in `Authorization: Bearer <token>` header | Sent in request body for `/api/v1/auth/refresh` |

### Token Rotation Mechanics
- When `/api/v1/auth/refresh` is called with a valid refresh token $R_1$:
  1. The token signature, expiration, and `type == "refresh"` claim are verified.
  2. The SHA-256 hash of $R_1$ is queried in `refresh_tokens`.
  3. If $R_1$ is already marked `revoked = True`, **Token Reuse is Detected**. The backend immediately revokes all active refresh tokens for the user to mitigate token theft, and returns `401 Unauthorized`.
  4. If valid, $R_1$ is marked `revoked = True` with timestamp `revoked_at`.
  5. A newly signed access token and new rotated refresh token $R_2$ are generated and persisted.
  6. $R_1$ can never be reused.

### Persistent Revocation & Logout
- Storing only the SHA-256 hash (`token_hash`) ensures raw tokens are never exposed in database logs or storage dumps.
- Calling `POST /api/v1/auth/logout`:
  - If a refresh token is supplied in the request body, that specific token is revoked.
  - All active refresh tokens for the authenticated user are marked `revoked = True` in `refresh_tokens`.
  - Subsequent refresh requests using revoked tokens fail with `401 Unauthorized`.

---

## 4. Rate Limiting & Distributed Brute-Force Protection

### Database-Backed Implementation (`failed_login_attempts`)
To protect against brute-force password guessing across distributed multi-worker servers (e.g., `uvicorn --workers 4`), login attempts are tracked in the database:
- **Lockout Threshold**: Configurable via `AUTH_MAX_FAILED_LOGIN_ATTEMPTS` (default: 5 attempts).
- **Lockout Window**: Configurable via `AUTH_LOCKOUT_MINUTES` (default: 15 minutes).
- **Identifier**: Normalized email address or client IP.
- **Account Enumeration Prevention**: Failed attempts are recorded regardless of whether the account exists. Unknown accounts return the exact same generic `401 Unauthorized` ("Invalid email or password.") and trigger the same lockout after 5 attempts.
- **Reset**: Successful authentication immediately removes all failed attempts for the identifier.

### In-Memory Fallback Limitations
An in-memory dictionary is retained solely for isolated local development and unit tests.
> [!WARNING]
> In-memory rate limiting is **not suitable for production** because:
> 1. Worker processes do not share memory; attackers can distribute attempts across worker processes.
> 2. Application restarts and container scaling reset all in-memory counters.
> 3. Clustered deployments cannot synchronize state without shared storage.

---

## 5. Production Configuration & Secret Validation

To ensure security in production deployments, `Settings` enforces strict validation rules via Pydantic model validators:
1. **Production Secret Strength**: In `ENVIRONMENT="production"`, `JWT_SECRET` must:
   - Not match any known development defaults (`dev-secret-key-change-in-production-ablenova`, `secret`, `changeme`, etc.).
   - Have a minimum length of at least 32 characters.
   - Failure to supply a secure secret raises a startup validation error, preventing insecure deployments.
2. **Short-Lived Access Tokens**: `ACCESS_TOKEN_EXPIRE_MINUTES` defaults to 30 minutes in production, reducing the window of vulnerability for compromised access tokens.

---

## 6. Endpoints Implemented

Mounted under `/api/v1` and `/api/v1/auth`:

| Endpoint | Method | Security | Summary |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Public (Student only) | Registers student account; rejects teacher/caregiver/admin escalation. |
| `/api/v1/auth/login` | `POST` | Rate Limited (DB-backed) | Authenticates credentials, issues access token & tracked refresh token. |
| `/api/v1/me` | `GET` | Bearer Access Token | Returns current authenticated user profile. |
| `/api/v1/auth/me` | `GET` | Bearer Access Token | Alternative alias for current user profile. |
| `/api/v1/auth/refresh` | `POST` | Public (Requires Refresh Token) | Rotates refresh token, detects reuse, and issues new access token. |
| `/api/v1/auth/logout` | `POST` | Bearer Access Token | Concludes session and persistently revokes all user refresh tokens. |

---

## 7. Reusable Authorization Dependencies

Located in [backend/app/api/deps.py](file:///c:/Users/HARI%20NANDHINI/OneDrive/Desktop/AbleNova/backend/app/api/deps.py):

```python
# Extract and validate current authenticated user
get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User

# Role-based access control factory
require_roles(*allowed_roles: UserRole)

# Role shortcut dependencies
require_student: User = Depends(require_roles(UserRole.STUDENT, UserRole.ADMIN))
require_teacher: User = Depends(require_roles(UserRole.TEACHER, UserRole.ADMIN))
require_caregiver: User = Depends(require_roles(UserRole.CAREGIVER, UserRole.ADMIN))
require_admin: User = Depends(require_roles(UserRole.ADMIN))
```

---

## 8. Child Privacy & Student Data Protection (`verify_student_access`)

AbleNova protects sensitive student progress, accommodations, and personal data from unauthorized access and IDOR attacks:

| Requesting User Role | Target Student | Access Permitted? | Condition |
| :--- | :--- | :--- | :--- |
| **Student** | Self (`student.user_id == current_user.id`) | **YES** | Student querying their own profile/records. |
| **Student** | Another Student | **NO (403 Forbidden)** | Strict isolation between students. |
| **Teacher** | Linked Student | **YES** | Active record in `teacher_students` table. |
| **Teacher** | Unlinked Student | **NO (403 Forbidden)** | "You do not have permission to access this student's data." |
| **Caregiver** | Linked Student | **YES** | Active record in `caregiver_students` table. |
| **Caregiver** | Unlinked Student | **NO (403 Forbidden)** | "You do not have permission to access this student's data." |
| **Admin** | Any Student | **YES** | Administrative oversight. |
| **Non-existent Student** | Any | **NO (404 Not Found)** | Returns 404 when student does not exist. |

---

## 9. Testing & Verification

Comprehensive test suites are located in:
- [backend/tests/test_auth.py](file:///c:/Users/HARI%20NANDHINI/OneDrive/Desktop/AbleNova/backend/tests/test_auth.py): 12 tests covering registration, login, password validation, duplicate email prevention, rate-limiting lockout, token refresh, and token type validation.
- [backend/tests/test_auth_hardening.py](file:///c:/Users/HARI%20NANDHINI/OneDrive/Desktop/AbleNova/backend/tests/test_auth_hardening.py): 10 tests covering role escalation rejection, refresh token rotation, token reuse detection, revocation on logout, persistent rate limiting, and production secret validation.
- [backend/tests/test_authorization.py](file:///c:/Users/HARI%20NANDHINI/OneDrive/Desktop/AbleNova/backend/tests/test_authorization.py): 10 tests covering missing/malformed tokens, expired tokens, role-based enforcement, student IDOR isolation, and teacher/caregiver relationship checks.
- Additional domain, database, schema, health, and mastery tests: 37 tests.

To run the complete test suite:
```bash
cd backend
.\venv\Scripts\python.exe -m pytest -v
```
