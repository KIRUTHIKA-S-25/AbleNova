"""Comprehensive tests for Quiz Engine, Assessment, Objective Grading,
Answer-Key Privacy, Idempotency, Mastery Integration, and Access Control.
Adheres strictly to docs/API_CONTRACT.md Sections 7, 8, 9, 20.
"""
import uuid
import pytest
from app.core.security import create_access_token
from app.db.models.curriculum import Lesson, Subject, Topic
from app.db.models.progress import StudentTopicMastery
from app.db.models.quiz import Question, Quiz, QuizAttempt
from app.db.models.student import AccessibilityProfile, Student
from app.db.models.user import Caregiver, CaregiverStudent, Teacher, TeacherStudent, User
from app.schemas.common import UserRole


@pytest.fixture
def quiz_fixtures(db_session):
    """Sets up a complete relational hierarchy for testing quizzes and assessments."""
    uid = uuid.uuid4().hex[:6]

    # 1. Subject & Topic
    subject = Subject(name=f"Mathematics {uid}", grade_level_min=3, grade_level_max=6)
    db_session.add(subject)
    db_session.commit()

    topic = Topic(subject_id=subject.id, name=f"Fractions {uid}", order_index=1)
    db_session.add(topic)
    db_session.commit()

    # 2. Lesson
    lesson = Lesson(
        topic_id=topic.id,
        title="Understanding Halves and Quarters",
        standard_content="A fraction represents a part of a whole.",
        simplified_content="Fractions are pieces of a whole.",
        grade_level=4,
    )
    db_session.add(lesson)
    db_session.commit()

    # 3. Teacher
    teacher_user = User(
        email=f"teacher_quiz_{uid}@example.com",
        name="Mr. Math",
        password_hash="hashed_pw",
        role=UserRole.TEACHER.value,
    )
    db_session.add(teacher_user)
    db_session.commit()
    teacher = Teacher(user_id=teacher_user.id)
    db_session.add(teacher)
    db_session.commit()
    teacher_token = create_access_token(subject=str(teacher_user.id), extra_claims={"role": teacher_user.role})

    # 4. Student A (Linked to Teacher)
    student_a_user = User(
        email=f"student_a_{uid}@example.com",
        name="Alice Student",
        password_hash="hashed_pw",
        role=UserRole.STUDENT.value,
    )
    db_session.add(student_a_user)
    db_session.commit()
    student_a = Student(user_id=student_a_user.id, age=9, grade=4, preferred_language="en")
    db_session.add(student_a)
    db_session.commit()
    ap_a = AccessibilityProfile(student_id=student_a.id, text_enabled=True)
    db_session.add(ap_a)
    db_session.commit()
    student_a_token = create_access_token(subject=str(student_a_user.id), extra_claims={"role": student_a_user.role})

    # Link Student A to Teacher
    ts = TeacherStudent(teacher_id=teacher.id, student_id=student_a.id)
    db_session.add(ts)
    db_session.commit()

    # 5. Student B (Not linked)
    student_b_user = User(
        email=f"student_b_{uid}@example.com",
        name="Bob Student",
        password_hash="hashed_pw",
        role=UserRole.STUDENT.value,
    )
    db_session.add(student_b_user)
    db_session.commit()
    student_b = Student(user_id=student_b_user.id, age=10, grade=5, preferred_language="en")
    db_session.add(student_b)
    db_session.commit()
    student_b_token = create_access_token(subject=str(student_b_user.id), extra_claims={"role": student_b_user.role})

    # 6. Caregiver (Linked to Student A)
    caregiver_user = User(
        email=f"caregiver_{uid}@example.com",
        name="Alice Parent",
        password_hash="hashed_pw",
        role=UserRole.CAREGIVER.value,
    )
    db_session.add(caregiver_user)
    db_session.commit()
    caregiver = Caregiver(user_id=caregiver_user.id)
    db_session.add(caregiver)
    db_session.commit()
    caregiver_token = create_access_token(subject=str(caregiver_user.id), extra_claims={"role": caregiver_user.role})

    cs = CaregiverStudent(caregiver_id=caregiver.id, student_id=student_a.id, relationship_type="parent")
    db_session.add(cs)
    db_session.commit()

    return {
        "subject": subject,
        "topic": topic,
        "lesson": lesson,
        "teacher": teacher,
        "teacher_token": teacher_token,
        "student_a": student_a,
        "student_a_token": student_a_token,
        "student_b": student_b,
        "student_b_token": student_b_token,
        "caregiver": caregiver,
        "caregiver_token": caregiver_token,
    }


# ==============================================================================
# 1. Quiz Authoring & CRUD
# ==============================================================================

def test_01_quiz_crud_by_teacher(client, quiz_fixtures):
    f = quiz_fixtures
    headers = {"Authorization": f"Bearer {f['teacher_token']}"}

    # 1. Create Quiz
    create_payload = {
        "lesson_id": str(f["lesson"].id),
        "topic_id": str(f["topic"].id),
        "title": "Fractions Unit Quiz",
        "description": "Assessment of basic fractional understanding",
        "passing_threshold": 0.70,
        "max_attempts": 3,
        "is_published": False,
    }
    resp = client.post("/api/v1/quizzes", json=create_payload, headers=headers)
    assert resp.status_code == 201
    quiz_data = resp.json()
    quiz_id = quiz_data["id"]
    assert quiz_data["title"] == "Fractions Unit Quiz"
    assert quiz_data["is_published"] is False
    assert quiz_data["passing_threshold"] == 0.70

    # 2. Add Question
    q_payload = {
        "topic_id": str(f["topic"].id),
        "question_text": "What is half of 10?",
        "question_type": "multiple_choice",
        "options": ["3", "5", "7", "8"],
        "correct_answer": "5",
        "explanation": "Half of 10 is 10 divided by 2, which equals 5.",
        "difficulty": "beginner",
        "marks": 1,
    }
    q_resp = client.post(f"/api/v1/quizzes/{quiz_id}/questions", json=q_payload, headers=headers)
    assert q_resp.status_code == 201
    q_data = q_resp.json()
    q_id = q_data["id"]
    assert q_data["correct_answer"] == "5"

    # 3. Update Quiz
    up_resp = client.put(f"/api/v1/quizzes/{quiz_id}", json={"title": "Fractions Unit Quiz v2"}, headers=headers)
    assert up_resp.status_code == 200
    assert up_resp.json()["title"] == "Fractions Unit Quiz v2"

    # 4. Update Question
    up_q_resp = client.put(
        f"/api/v1/quizzes/{quiz_id}/questions/{q_id}",
        json={"question_text": "What is one-half of 10?"},
        headers=headers,
    )
    assert up_q_resp.status_code == 200
    assert up_q_resp.json()["question_text"] == "What is one-half of 10?"

    # 5. Delete Question & Quiz
    del_q = client.delete(f"/api/v1/quizzes/{quiz_id}/questions/{q_id}", headers=headers)
    assert del_q.status_code == 204

    del_quiz = client.delete(f"/api/v1/quizzes/{quiz_id}", headers=headers)
    assert del_quiz.status_code == 204


# ==============================================================================
# 2. Publication Restrictions & Answer-Key Privacy
# ==============================================================================

def test_02_publication_restrictions_and_answer_key_privacy(client, quiz_fixtures, db_session):
    f = quiz_fixtures
    teacher_h = {"Authorization": f"Bearer {f['teacher_token']}"}
    student_h = {"Authorization": f"Bearer {f['student_a_token']}"}

    # Create quiz
    q_create = client.post(
        "/api/v1/quizzes",
        json={"lesson_id": str(f["lesson"].id), "title": "Geometry Quiz", "is_published": False},
        headers=teacher_h,
    )
    quiz_id = q_create.json()["id"]

    # Student cannot view unpublished quiz
    st_get = client.get(f"/api/v1/quizzes/{quiz_id}", headers=student_h)
    assert st_get.status_code == 403

    # Teacher cannot publish empty quiz (zero questions)
    pub_empty = client.post(f"/api/v1/quizzes/{quiz_id}/publish", headers=teacher_h)
    assert pub_empty.status_code == 422
    assert pub_empty.json()["error"]["code"] == "VALIDATION_ERROR"

    # Add question
    client.post(
        f"/api/v1/quizzes/{quiz_id}/questions",
        json={
            "topic_id": str(f["topic"].id),
            "question_text": "A square has four equal sides.",
            "question_type": "true_false",
            "options": ["True", "False"],
            "correct_answer": "True",
            "explanation": "By definition, all 4 sides of a square are of equal length.",
            "marks": 1,
        },
        headers=teacher_h,
    )

    # Publish quiz
    pub_resp = client.post(f"/api/v1/quizzes/{quiz_id}/publish", headers=teacher_h)
    assert pub_resp.status_code == 200
    assert pub_resp.json()["is_published"] is True

    # Student can now retrieve published quiz
    st_quiz = client.get(f"/api/v1/quizzes/{quiz_id}", headers=student_h)
    assert st_quiz.status_code == 200
    data = st_quiz.json()
    assert data["title"] == "Geometry Quiz"
    assert len(data["questions"]) == 1

    # CRITICAL SECURITY CHECK (API_CONTRACT.md Sec 7):
    # Verify student response contains NO correct_answer or explanation!
    q_item = data["questions"][0]
    assert "correct_answer" not in q_item
    assert "explanation" not in q_item
    assert q_item["question"] == "A square has four equal sides."


# ==============================================================================
# 3. Objective Grading, Scores, and Passing Thresholds
# ==============================================================================

def test_03_objective_grading_and_evaluation(client, quiz_fixtures):
    f = quiz_fixtures
    teacher_h = {"Authorization": f"Bearer {f['teacher_token']}"}
    student_h = {"Authorization": f"Bearer {f['student_a_token']}"}

    # Create published quiz with 3 questions
    q_create = client.post(
        "/api/v1/quizzes",
        json={
            "lesson_id": str(f["lesson"].id),
            "topic_id": str(f["topic"].id),
            "title": "Comprehensive Math Quiz",
            "passing_threshold": 0.60,
            "is_published": True,
            "questions": [
                {
                    "topic_id": str(f["topic"].id),
                    "question_text": "What is 3 + 4?",
                    "question_type": "multiple_choice",
                    "options": ["5", "6", "7", "8"],
                    "correct_answer": "7",
                    "explanation": "3 plus 4 equals 7.",
                    "marks": 1,
                },
                {
                    "topic_id": str(f["topic"].id),
                    "question_text": "Is 10 an even number?",
                    "question_type": "true_false",
                    "options": ["True", "False"],
                    "correct_answer": "True",
                    "explanation": "10 is divisible by 2 without a remainder.",
                    "marks": 1,
                },
                {
                    "topic_id": str(f["topic"].id),
                    "question_text": "Select prime numbers under 5",
                    "question_type": "multiple_select",
                    "options": ["2", "3", "4"],
                    "correct_answer": "2,3",
                    "explanation": "2 and 3 are prime numbers.",
                    "marks": 1,
                },
            ],
        },
        headers=teacher_h,
    )
    quiz = q_create.json()
    quiz_id = quiz["id"]
    q1_id = quiz["questions"][0]["id"]
    q2_id = quiz["questions"][1]["id"]
    q3_id = quiz["questions"][2]["id"]

    # Student submits 2 correct, 1 incorrect
    submission = {
        "client_submission_id": f"sub_{uuid.uuid4().hex[:8]}",
        "answers": [
            {"question_id": q1_id, "answer": "7", "time_taken_seconds": 15},   # Correct
            {"question_id": q2_id, "answer": "False", "time_taken_seconds": 10}, # Incorrect
            {"question_id": q3_id, "answer": "2,3", "time_taken_seconds": 25},   # Correct
        ],
    }
    sub_resp = client.post(f"/api/v1/quizzes/{quiz_id}/submit", json=submission, headers=student_h)
    assert sub_resp.status_code == 200
    res = sub_resp.json()

    assert res["score"] == 2
    assert res["total"] == 3
    assert res["accuracy"] == 0.67
    assert res["is_passed"] is True
    assert res["time_taken_seconds"] == 50
    assert len(res["topic_results"]) == 1
    assert "feedback" in res
    assert "question_results" in res
    assert len(res["question_results"]) == 3

    # Post-submission unlocked explanations
    q1_res = next(qr for qr in res["question_results"] if qr["question_id"] == q1_id)
    assert q1_res["is_correct"] is True
    assert q1_res["explanation"] == "3 plus 4 equals 7."


# ==============================================================================
# 4. Idempotency & Duplicate Submission Protection
# ==============================================================================

def test_04_idempotent_duplicate_submission(client, quiz_fixtures, db_session):
    f = quiz_fixtures
    teacher_h = {"Authorization": f"Bearer {f['teacher_token']}"}
    student_h = {"Authorization": f"Bearer {f['student_a_token']}"}

    q_create = client.post(
        "/api/v1/quizzes",
        json={
            "lesson_id": str(f["lesson"].id),
            "title": "Idempotency Test Quiz",
            "is_published": True,
            "questions": [
                {
                    "topic_id": str(f["topic"].id),
                    "question_text": "Is Earth round?",
                    "options": ["True", "False"],
                    "correct_answer": "True",
                    "marks": 1,
                }
            ],
        },
        headers=teacher_h,
    )
    quiz_id = q_create.json()["id"]
    q_id = q_create.json()["questions"][0]["id"]

    idempotency_key = f"client_sub_{uuid.uuid4().hex}"
    payload = {
        "client_submission_id": idempotency_key,
        "answers": [{"question_id": q_id, "answer": "True", "time_taken_seconds": 12}],
    }

    # 1. First submission
    resp1 = client.post(f"/api/v1/quizzes/{quiz_id}/submit", json=payload, headers=student_h)
    assert resp1.status_code == 200
    res1 = resp1.json()

    # 2. Replay duplicate submission
    resp2 = client.post(f"/api/v1/quizzes/{quiz_id}/submit", json=payload, headers=student_h)
    assert resp2.status_code == 200
    res2 = resp2.json()

    # Should return identical attempt ID and score without duplicating attempt records
    assert res1["attempt_id"] == res2["attempt_id"]
    assert res1["score"] == res2["score"]

    # Verify database has exactly 1 attempt
    attempt_count = db_session.query(QuizAttempt).filter(
        QuizAttempt.quiz_id == uuid.UUID(quiz_id),
        QuizAttempt.client_submission_id == idempotency_key,
    ).count()
    assert attempt_count == 1


# ==============================================================================
# 5. Attempt Limits
# ==============================================================================

def test_05_attempt_limits_enforced(client, quiz_fixtures):
    f = quiz_fixtures
    teacher_h = {"Authorization": f"Bearer {f['teacher_token']}"}
    student_h = {"Authorization": f"Bearer {f['student_a_token']}"}

    # Max attempts = 2
    q_create = client.post(
        "/api/v1/quizzes",
        json={
            "lesson_id": str(f["lesson"].id),
            "title": "Strict Limit Quiz",
            "max_attempts": 2,
            "is_published": True,
            "questions": [
                {
                    "topic_id": str(f["topic"].id),
                    "question_text": "Sample Q?",
                    "options": ["A", "B"],
                    "correct_answer": "A",
                }
            ],
        },
        headers=teacher_h,
    )
    quiz_id = q_create.json()["id"]
    q_id = q_create.json()["questions"][0]["id"]

    # Attempt 1
    r1 = client.post(
        f"/api/v1/quizzes/{quiz_id}/submit",
        json={"answers": [{"question_id": q_id, "answer": "A"}]},
        headers=student_h,
    )
    assert r1.status_code == 200

    # Attempt 2
    r2 = client.post(
        f"/api/v1/quizzes/{quiz_id}/submit",
        json={"answers": [{"question_id": q_id, "answer": "A"}]},
        headers=student_h,
    )
    assert r2.status_code == 200

    # Attempt 3 (Should fail)
    r3 = client.post(
        f"/api/v1/quizzes/{quiz_id}/submit",
        json={"answers": [{"question_id": q_id, "answer": "A"}]},
        headers=student_h,
    )
    assert r3.status_code == 422
    assert "limit" in r3.json()["error"]["message"].lower()


# ==============================================================================
# 6. Progress & Topic Mastery Integration
# ==============================================================================

def test_06_student_topic_mastery_updated(client, quiz_fixtures, db_session):
    f = quiz_fixtures
    teacher_h = {"Authorization": f"Bearer {f['teacher_token']}"}
    student_h = {"Authorization": f"Bearer {f['student_a_token']}"}

    q_create = client.post(
        "/api/v1/quizzes",
        json={
            "lesson_id": str(f["lesson"].id),
            "topic_id": str(f["topic"].id),
            "title": "Mastery Trigger Quiz",
            "is_published": True,
            "questions": [
                {
                    "topic_id": str(f["topic"].id),
                    "question_text": "What is 2/4 simplified?",
                    "options": ["1/2", "1/4", "3/4"],
                    "correct_answer": "1/2",
                }
            ],
        },
        headers=teacher_h,
    )
    quiz_id = q_create.json()["id"]
    q_id = q_create.json()["questions"][0]["id"]

    # Submit correct answer
    client.post(
        f"/api/v1/quizzes/{quiz_id}/submit",
        json={"answers": [{"question_id": q_id, "answer": "1/2"}]},
        headers=student_h,
    )

    # Verify student_topic_mastery was populated in DB
    mastery = db_session.query(StudentTopicMastery).filter(
        StudentTopicMastery.student_id == f["student_a"].id,
        StudentTopicMastery.topic_id == f["topic"].id,
    ).first()

    assert mastery is not None
    assert mastery.mastery_score > 0.0
    assert mastery.confidence > 0.0


# ==============================================================================
# 7. Attempt History & IDOR Protection
# ==============================================================================

def test_07_attempt_history_and_idor_protection(client, quiz_fixtures):
    f = quiz_fixtures
    teacher_h = {"Authorization": f"Bearer {f['teacher_token']}"}
    student_a_h = {"Authorization": f"Bearer {f['student_a_token']}"}
    student_b_h = {"Authorization": f"Bearer {f['student_b_token']}"}
    caregiver_h = {"Authorization": f"Bearer {f['caregiver_token']}"}

    # Setup and take quiz as Student A
    q_create = client.post(
        "/api/v1/quizzes",
        json={
            "lesson_id": str(f["lesson"].id),
            "title": "History Quiz",
            "is_published": True,
            "questions": [
                {
                    "topic_id": str(f["topic"].id),
                    "question_text": "Q1",
                    "options": ["A", "B"],
                    "correct_answer": "A",
                }
            ],
        },
        headers=teacher_h,
    )
    quiz_id = q_create.json()["id"]
    q_id = q_create.json()["questions"][0]["id"]

    sub_res = client.post(
        f"/api/v1/quizzes/{quiz_id}/submit",
        json={"answers": [{"question_id": q_id, "answer": "A"}]},
        headers=student_a_h,
    )
    attempt_id = sub_res.json()["attempt_id"]

    # 1. Student A can list own attempts
    a_list = client.get(f"/api/v1/quizzes/{quiz_id}/attempts", headers=student_a_h)
    assert a_list.status_code == 200
    assert len(a_list.json()) >= 1

    # 2. Student A can view attempt details
    a_det = client.get(f"/api/v1/quizzes/attempts/{attempt_id}", headers=student_a_h)
    assert a_det.status_code == 200
    assert a_det.json()["attempt_id"] == attempt_id

    # 3. Student B CANNOT view Student A's attempt (IDOR Guard)
    b_det = client.get(f"/api/v1/quizzes/attempts/{attempt_id}", headers=student_b_h)
    assert b_det.status_code == 403

    # 4. Linked Teacher CAN view Student A's attempts
    t_list = client.get(f"/api/v1/quizzes/{quiz_id}/attempts?student_id={f['student_a'].id}", headers=teacher_h)
    assert t_list.status_code == 200

    # 5. Teacher CANNOT view unlinked Student B's attempts
    t_unlinked = client.get(f"/api/v1/quizzes/{quiz_id}/attempts?student_id={f['student_b'].id}", headers=teacher_h)
    assert t_unlinked.status_code == 403

    # 6. Linked Caregiver CAN view Student A's attempts
    c_list = client.get(f"/api/v1/quizzes/{quiz_id}/attempts?student_id={f['student_a'].id}", headers=caregiver_h)
    assert c_list.status_code == 200

    # 7. Student cannot create quiz (Role guard)
    st_create = client.post(
        "/api/v1/quizzes",
        json={"lesson_id": str(f["lesson"].id), "title": "Hacked Quiz"},
        headers=student_a_h,
    )
    assert st_create.status_code == 403
