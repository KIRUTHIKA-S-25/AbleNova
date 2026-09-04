# API_CONTRACT.md

## Overview
This document defines the public HTTP API contract for the AbleNova backend. All endpoints, request/response schemas, and error codes are specified here. The frontend must adhere to these definitions.

### Base URL
```
https://api.example.com/api/v1
```

### Common Response Format
```json
{
  "status": "success" | "error",
  "data": {...},
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

### Endpoints (selected)
- `GET /` – health check, returns message.
- `GET /health` – simple health status.
- `POST /auth/register` – register new user.
- `POST /auth/login` – login, returns JWT.
- `GET /subjects` – list subjects.
- `GET /quizzes/{quiz_id}` – get quiz details.
- `POST /quizzes/{quiz_id}/attempts` – start attempt.
- `POST /quizzes/{quiz_id}/submit` – bulk submit answers.
- `GET /quiz-attempts/me` – list student's attempts.

*All other routes are defined in the code and must conform to the schemas in `app/schemas/`.*
