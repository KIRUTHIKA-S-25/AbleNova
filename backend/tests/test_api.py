import unittest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db

# Compile PostgreSQL JSONB type to SQLite JSON for testing
@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


class TestAbleNovaAPI(unittest.TestCase):

    def setUp(self):
        Base.metadata.create_all(bind=engine)
        self.client = TestClient(app)

    def tearDown(self):
        Base.metadata.drop_all(bind=engine)

    def _get_auth_header(self, user_data: dict) -> dict:
        self.client.post("/api/v1/auth/register", json=user_data)
        response = self.client.post(
            "/api/v1/auth/login",
            json={
                "email": user_data["email"],
                "password": user_data["password"],
            },
        )
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_root_and_health(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "success")

        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "healthy")

        res = self.client.get("/docs")
        self.assertEqual(res.status_code, 200)

        res = self.client.get("/openapi.json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["info"]["title"], "AbleNova API")

    def test_register_and_login(self):
        user = {
            "email": "student1@example.com",
            "name": "Student One",
            "password": "Password123!",
            "role": "student",
        }
        res = self.client.post("/api/v1/auth/register", json=user)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()["email"], user["email"])

        res = self.client.post("/api/v1/auth/register", json=user)
        self.assertEqual(res.status_code, 409)

        res = self.client.post(
            "/api/v1/auth/login",
            json={"email": user["email"], "password": user["password"]},
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("access_token", res.json())

        res = self.client.post(
            "/api/v1/auth/login",
            json={"email": user["email"], "password": "WrongPassword"},
        )
        self.assertEqual(res.status_code, 401)

    def test_unauthenticated_and_role_protection(self):
        res = self.client.get("/api/v1/auth/me")
        self.assertEqual(res.status_code, 401)

        res = self.client.get("/api/v1/students/me")
        self.assertEqual(res.status_code, 401)

        teacher_headers = self._get_auth_header({
            "email": "teacher1@example.com",
            "name": "Teacher One",
            "password": "Password123!",
            "role": "teacher",
        })

        res = self.client.get("/api/v1/students/me", headers=teacher_headers)
        self.assertEqual(res.status_code, 403)

        res = self.client.get(
            "/api/v1/auth/student-only", headers=teacher_headers
        )
        self.assertEqual(res.status_code, 403)

    def test_student_profile_and_accessibility(self):
        headers = self._get_auth_header({
            "email": "student2@example.com",
            "name": "Student Two",
            "password": "Password123!",
            "role": "student",
        })

        res = self.client.get("/api/v1/students/me", headers=headers)
        self.assertEqual(res.status_code, 404)

        res = self.client.post(
            "/api/v1/students/",
            json={"age": 14, "grade": 8, "preferred_language": "en"},
            headers=headers,
        )
        self.assertEqual(res.status_code, 201)

        res = self.client.post(
            "/api/v1/students/",
            json={"age": 14, "grade": 8, "preferred_language": "en"},
            headers=headers,
        )
        self.assertEqual(res.status_code, 409)

        res = self.client.get("/api/v1/students/me", headers=headers)
        self.assertEqual(res.status_code, 200)

        res = self.client.post(
            "/api/v1/accessibility/me",
            json={"text_enabled": True, "audio_enabled": True},
            headers=headers,
        )
        self.assertEqual(res.status_code, 201)

        res = self.client.get("/api/v1/accessibility/me", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["audio_enabled"])

    def test_missing_resources_returns_404(self):
        random_uuid = str(uuid.uuid4())

        headers = self._get_auth_header({
            "email": "student3@example.com",
            "name": "Student Three",
            "password": "Password123!",
            "role": "student",
        })
        self.client.post(
            "/api/v1/students/",
            json={"age": 12, "grade": 6, "preferred_language": "en"},
            headers=headers,
        )

        res = self.client.get(f"/api/v1/topics/{random_uuid}")
        self.assertEqual(res.status_code, 404)

        res = self.client.get(f"/api/v1/lessons/{random_uuid}")
        self.assertEqual(res.status_code, 404)

        res = self.client.post(
            "/api/v1/progress/sessions",
            json={"lesson_id": random_uuid},
            headers=headers,
        )
        self.assertEqual(res.status_code, 404)

        res = self.client.post(
            "/api/v1/progress/mastery",
            json={
                "topic_id": random_uuid,
                "mastery_score": 0.8,
                "confidence": 0.9,
            },
            headers=headers,
        )
        self.assertEqual(res.status_code, 404)

    def test_resource_ownership_violation(self):
        s1_headers = self._get_auth_header({
            "email": "owner1@example.com",
            "name": "Owner One",
            "password": "Password123!",
            "role": "student",
        })
        self.client.post(
            "/api/v1/students/",
            json={"age": 15, "grade": 9, "preferred_language": "en"},
            headers=s1_headers,
        )

        s2_headers = self._get_auth_header({
            "email": "owner2@example.com",
            "name": "Owner Two",
            "password": "Password123!",
            "role": "student",
        })
        self.client.post(
            "/api/v1/students/",
            json={"age": 16, "grade": 10, "preferred_language": "en"},
            headers=s2_headers,
        )

        attempt_id = str(uuid.uuid4())

        res = self.client.put(
            f"/api/v1/quiz-attempts/{attempt_id}/complete",
            json={"time_taken_seconds": 30},
            headers=s2_headers,
        )
        self.assertIn(res.status_code, [403, 404])


if __name__ == "__main__":
    unittest.main()
