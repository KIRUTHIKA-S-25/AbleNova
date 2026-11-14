# AbleNova Authentication & Role-Based Authorization Architecture

## 1. Authentication Architecture Decision

AbleNova implements **Application-Managed JWT Authentication** using HMAC-SHA256 (`HS256`) and `bcrypt` password hashing, fully integrated with the FastAPI backend and PostgreSQL database.

### Decision Rationale:
- **Consistency with API Contract**: Directly fulfills `docs/API_CONTRACT.md` Section 2 ("Authentication") and `docs/ARCHITECTURE.md` Section 6 ("Security Architecture").
- **Offline & Edge Capability**: AbleNova operates in low-connectivity and rural/remote environments. Application-managed JWT tokens enable decoupled validation and edge synchronization without synchronous round-trips to external third-party identity providers.
- **Single Source of Truth**: User records, roles, passwords, and profile linkages reside in the internal `users`, `students`, `teachers`, and `caregivers` tables, avoiding multi-system sync issues or vendor lock-in.

---

## 2. Token Lifecycle & Specifications

All authentication tokens are issued as JSON Web Tokens signed with `SECRET_KEY` using the `HS256` algorithm.

| Attribute | Access Token | Refresh Token |
| :--- | :--- | :--- |
| **Claim Type (`type`)** | `"access"` | `"refresh"` |
| **Subject (`sub`)** | User ID (`UUID` as string) | User ID (`UUID` as string) |
| **Role Claim (`role`)** | `"student" \| "teacher" \| "caregiver" \| "admin"` | N/A |
| **Email Claim (`email`)** | User Email | N/A |
| **Default Lifespan** | 60 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES`) | 7 days (`REFRESH_TOKEN_EXPIRE_DAYS`) |
| **Storage & Usage** | Sent in `Authorization: Bearer <token>` header | Sent in POST body for `/api/v1/auth/refresh` |

### Token Substitution Prevention:
- Access token validation strictly rejects tokens with `type != "access"`. A refresh token cannot be used in place of an access token to access protected endpoints.
- Refresh token validation strictly rejects tokens with `type != "refresh"`.

---

## 3. Endpoints Implemented

All authentication routes are mounted under `/api/v1` and `/api/v1/auth`.

### 1. `POST /api/v1/auth/register`
- **Description**: Registers a new user account with role selection (`student`, `teacher`, `caregiver`).
- **Input Schema**: `UserCreate` (`email`, `password`, `first_name`, `last_name`, `role`).
- **Security Validations**:
  - Email uniqueness check (case-insensitive, trimmed). Returns `400 Bad Request` if already in use.
  - Password strength validation: minimum 8 characters, maximum 128 characters, containing uppercase, lowercase, and numeric digits.
  - Role validation: only non-admin roles can be self-registered (`student`, `teacher`, `caregiver`).
  - Passwords are encrypted with `bcrypt` (work factor 12) before storage. Plaintext passwords are never stored.
- **Entity Creation**:
  - Automatically provisions the associated role entity (`Student` + default `AccessibilityProfile`, `Teacher`, or `Caregiver`).
- **Response**: `201 Created` returning `TokenResponse` with both `access_token` and `refresh_token`, token metadata, and serialized user profile.

### 2. `POST /api/v1/auth/login`
- **Description**: Authenticates user credentials and issues tokens.
- **Input Schema**: `UserLogin` (`email`, `password`).
- **Security & Rate Limiting**:
  - Protects against brute-force attacks via IP + email tracking (`AUTH_MAX_FAILED_LOGIN_ATTEMPTS=5`, `AUTH_LOCKOUT_MINUTES=15`).
  - Returns generic `401 Unauthorized` ("Invalid email or password") on credential mismatches to prevent user enumeration.
  - Rejects inactive accounts with `403 Forbidden` ("User account is inactive").
  - On successful login, failed attempt counters are reset.
- **Response**: `200 OK` returning `TokenResponse` with `access_token`, `refresh_token`, and user profile.

### 3. `GET /api/v1/me` & `GET /api/v1/auth/me`
- **Description**: Retrieves current authenticated user profile, preferences, and associated role information.
- **Authentication**: Requires valid Bearer access token.
- **Response**: `200 OK` returning `UserResponse`. Password hashes are strictly omitted.

### 4. `POST /api/v1/auth/refresh`
- **Description**: Refreshes an expired access token using a valid, non-expired refresh token.
- **Input Schema**: `TokenRefreshRequest` (`refresh_token`).
- **Validation**:
  - Verifies token signature, expiration, and ensures `type == "refresh"`.
  - Verifies subject user exists and remains active.
- **Response**: `200 OK` returning `TokenRefreshResponse` (`access_token`, `token_type`, `expires_in`).

### 5. `POST /api/v1/auth/logout`
- **Description**: Logs out the authenticated user.
- **Authentication**: Requires valid Bearer access token.
- **Response**: `200 OK` with confirmation message `{"message": "Successfully logged out"}`.

---

## 4. Reusable Authorization Dependencies

Located in `backend/app/api/deps.py`:

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

## 5. Child Privacy & Student Data Protection (`verify_student_access`)

AbleNova serves children with disabilities. Protecting sensitive learning progress, accommodations, and personal data from unauthorized access or Insecure Direct Object Reference (IDOR) attacks is critical.

The dependency `verify_student_access(student_id: UUID, current_user: User, db: Session)` enforces the following access control matrix:

| Requesting User Role | Target Student | Access Permitted? | Condition |
| :--- | :--- | :--- | :--- |
| **Student** | Self (`student.user_id == current_user.id`) | **YES** | Student querying their own profile/records. |
| **Student** | Another Student | **NO (403 Forbidden)** | Strict isolation between students. |
| **Teacher** | Linked Student | **YES** | Active record in `teacher_students` table. |
| **Teacher** | Unlinked Student | **NO (403 Forbidden)** | "You do not have permission to access this student's data." |
| **Caregiver** | Linked Student | **YES** | Active record in `caregiver_students` table. |
| **Caregiver** | Unlinked Student | **NO (403 Forbidden)** | "You do not have permission to access this student's data." |
| **Admin** | Any Student | **YES** | System administrative oversight. |
| **Non-existent Student** | Any | **NO (404 Not Found)** | Returns 404 when student does not exist. |

### Privacy Boundaries:
- **No Medical Data**: The database and API schemas strictly avoid diagnostic, medical, or clinical questions/fields.
- **Functional Accessibility**: Accommodations (`font_size`, `high_contrast`, `screen_reader_enabled`, `speech_rate`) are purely functional learning preferences.

---

## 6. Testing & Verification

Authentication and authorization test suites are located in:
- `backend/tests/test_auth.py`: Registration, login, password validation, duplicate email prevention, rate-limiting lockout, token refresh, and token type validation.
- `backend/tests/test_authorization.py`: Missing/malformed tokens, expired tokens, role-based enforcement, student IDOR isolation, teacher/caregiver relationship checks.

To run the complete test suite:
```bash
cd backend
pytest -v
```
