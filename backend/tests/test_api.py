import unittest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.db.models.lesson import Lesson
from app.db.models.question import Question
from app.db.models.quiz import Quiz
from app.db.models.subject import Subject
from app.db.models.topic import Topic
from app.main import app


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

    def _register_user(self, user_data: dict) -> dict:
        return self.client.post("/api/v1/auth/register", json=user_data)

    def _get_auth_header(self, user_data: dict) -> dict:
        res = self._register_user(user_data)
        if res.status_code == 201 and "access_token" in res.json():
            token = res.json()["access_token"]
        else:
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
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["email"], user["email"])

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

    def test_student_contract_endpoints(self):
        headers = self._get_auth_header({
            "email": "student_contract@example.com",
            "name": "Student Contract",
            "password": "Password123!",
            "role": "student",
        })
        self.client.post(
            "/api/v1/students/",
            json={"age": 13, "grade": 7, "preferred_language": "en"},
            headers=headers,
        )

        res = self.client.get("/api/v1/student/profile", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["grade"], 7)

        res = self.client.put(
            "/api/v1/student/profile",
            json={"age": 14, "grade": 8, "preferred_language": "es"},
            headers=headers,
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["grade"], 8)
        self.assertEqual(res.json()["preferred_language"], "es")

        res = self.client.get("/api/v1/student/progress", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertIn("overall_progress", res.json())
        self.assertIn("learning_time_minutes", res.json())

        res = self.client.get("/api/v1/student/recommendations", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertIn("recommendations", res.json())

        res = self.client.get("/api/v1/student/learning-path", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertIn("items", res.json())

    def test_bulk_quiz_submission_and_mastery(self):
        # Setup student
        headers = self._get_auth_header({
            "email": "quiz_student@example.com",
            "name": "Quiz Student",
            "password": "Password123!",
            "role": "student",
        })
        self.client.post(
            "/api/v1/students/",
            json={"age": 15, "grade": 9, "preferred_language": "en"},
            headers=headers,
        )

        # Create Subject, Topic, Lesson, Quiz, Questions directly in DB
        db = TestingSessionLocal()
        subject = Subject(name="Math", description="Mathematics")
        db.add(subject)
        db.commit()
        db.refresh(subject)

        topic = Topic(subject_id=subject.id, name="Algebra", description="Intro to Algebra")
        db.add(topic)
        db.commit()
        db.refresh(topic)

        lesson = Lesson(
            topic_id=topic.id,
            title="Intro to Algebra",
            difficulty="medium",
            language="en",
            estimated_minutes=15,
        )
        db.add(lesson)
        db.commit()
        db.refresh(lesson)

        quiz = Quiz(lesson_id=lesson.id, title="Algebra Quiz 1")
        db.add(quiz)
        db.commit()
        db.refresh(quiz)

        q1 = Question(
            quiz_id=quiz.id,
            topic_id=topic.id,
            question_text="What is 2+2?",
            question_type="multiple_choice",
            options=["1", "2", "3", "4"],
            correct_answer="4",
            difficulty="easy",
        )
        q2 = Question(
            quiz_id=quiz.id,
            topic_id=topic.id,
            question_text="What is 3*3?",
            question_type="multiple_choice",
            options=["6", "9", "12"],
            correct_answer="9",
            difficulty="medium",
        )
        db.add_all([q1, q2])
        db.commit()
        quiz_id = str(quiz.id)
        q1_id = str(q1.id)
        q2_id = str(q2.id)
        db.close()

        # Submit quiz answers
        submit_payload = {
            "answers": [
                {"question_id": q1_id, "selected_answer": "4", "time_spent_seconds": 10},
                {"question_id": q2_id, "selected_answer": "6", "time_spent_seconds": 15},
            ]
        }
        res = self.client.post(
            f"/api/v1/quizzes/{quiz_id}/submit",
            json=submit_payload,
            headers=headers,
        )
        self.assertEqual(res.status_code, 200)
        result = res.json()
        self.assertEqual(result["score"], 1)
        self.assertEqual(result["total"], 2)
        self.assertIn(result["accuracy"], [0.5, 50.0])
        self.assertIn("topic_results", result)
        self.assertIn("feedback", result)

        # Check that progress reflects the attempt
        prog_res = self.client.get("/api/v1/student/progress", headers=headers)
        self.assertEqual(prog_res.status_code, 200)
        self.assertIn("overall_progress", prog_res.json())

    def test_caregiver_endpoints_and_authorization(self):
        # Create student
        s_headers = self._get_auth_header({
            "email": "c_student@example.com",
            "name": "C Student",
            "password": "Password123!",
            "role": "student",
        })
        s_reg = self.client.post(
            "/api/v1/students/",
            json={"age": 10, "grade": 4, "preferred_language": "en"},
            headers=s_headers,
        )
        student_id = s_reg.json()["id"]

        # Create Caregiver 1
        c1_headers = self._get_auth_header({
            "email": "caregiver1@example.com",
            "name": "Caregiver One",
            "password": "Password123!",
            "role": "caregiver",
        })
        self.client.post("/api/v1/caregiver", headers=c1_headers)

        # Authorized caregiver access
        res = self.client.get(f"/api/v1/caregiver/student/{student_id}", headers=c1_headers)
        self.assertEqual(res.status_code, 200)
        self.assertIn("strengths", res.json())
        self.assertIn("areas_for_practice", res.json())

        # Unregistered caregiver (without profile) returns 404
        c2_headers = self._get_auth_header({
            "email": "caregiver2@example.com",
            "name": "Caregiver Two",
            "password": "Password123!",
            "role": "caregiver",
        })
        res_unauth = self.client.get(f"/api/v1/caregiver/student/{student_id}", headers=c2_headers)
        self.assertEqual(res_unauth.status_code, 404)

    def test_teacher_endpoints_and_authorization(self):
        # Create student
        s_headers = self._get_auth_header({
            "email": "t_student@example.com",
            "name": "T Student",
            "password": "Password123!",
            "role": "student",
        })
        s_reg = self.client.post(
            "/api/v1/students/",
            json={"age": 12, "grade": 6, "preferred_language": "en"},
            headers=s_headers,
        )
        student_id = s_reg.json()["id"]

        # Create Teacher 1
        t1_headers = self._get_auth_header({
            "email": "teacher_linked@example.com",
            "name": "Teacher Linked",
            "password": "Password123!",
            "role": "teacher",
        })
        self.client.post("/api/v1/teacher", headers=t1_headers)

        # Teacher 1 accesses students list
        res = self.client.get("/api/v1/teacher/students", headers=t1_headers)
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.json()["students"]), 1)

        # Teacher 1 accesses specific student
        res_s = self.client.get(f"/api/v1/teacher/students/{student_id}", headers=t1_headers)
        self.assertEqual(res_s.status_code, 200)
        self.assertEqual(res_s.json()["student_id"], student_id)

        # Teacher 1 accesses analytics
        res_a = self.client.get("/api/v1/teacher/analytics", headers=t1_headers)
        self.assertEqual(res_a.status_code, 200)
        self.assertIn("average_progress", res_a.json())

        # Teacher without profile access returns 404
        t2_headers = self._get_auth_header({
            "email": "teacher_unlinked@example.com",
            "name": "Teacher Unlinked",
            "password": "Password123!",
            "role": "teacher",
        })
        res_unauth = self.client.get(f"/api/v1/teacher/students/{student_id}", headers=t2_headers)
        self.assertEqual(res_unauth.status_code, 404)

    def test_sync_duplicate_local_id(self):
        headers = self._get_auth_header({
            "email": "sync_user@example.com",
            "name": "Sync User",
            "password": "Password123!",
            "role": "student",
        })
        self.client.post(
            "/api/v1/students/",
            json={"age": 11, "grade": 5, "preferred_language": "en"},
            headers=headers,
        )

        sync_payload = {
            "events": [
                {
                    "local_id": "event-12345",
                    "event_type": "interaction",
                    "payload": {"action": "click", "target": "button1"},
                    "occurred_at": "2026-09-04T12:00:00Z",
                }
            ]
        }

        # First sync
        res1 = self.client.post("/api/v1/sync", json=sync_payload, headers=headers)
        self.assertEqual(res1.status_code, 200)
        self.assertIn("event-12345", res1.json()["synced"])

        # Second sync with duplicate local_id
        res2 = self.client.post("/api/v1/sync", json=sync_payload, headers=headers)
        self.assertEqual(res2.status_code, 200)
        self.assertIn("event-12345", res2.json()["synced"])
        self.assertEqual(len(res2.json()["failed"]), 0)

    def test_ai_explanation_fallback_modes(self):
        headers = self._get_auth_header({
            "email": "ai_user@example.com",
            "name": "AI User",
            "password": "Password123!",
            "role": "student",
        })

        for mode in ["standard", "simplified", "hint", "example", "summary"]:
            payload = {
                "question": "Explain Newton's First Law of Motion",
                "mode": mode,
            }
            res = self.client.post("/api/v1/ai/explanation", json=payload, headers=headers)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["mode"], mode)
            self.assertIn("response", data)
            self.assertGreater(len(data["response"]), 0)


if __name__ == "__main__":
    unittest.main()
