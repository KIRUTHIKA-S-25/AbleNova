"""
AI Service — AbleNova
======================
Provides accessible AI-powered educational explanations supporting:
- standard: comprehensive clear explanation
- simplified: plain language, short sentences for cognitive accessibility
- hint: gentle guidance without giving away direct answers
- example: concrete real-world analogies and examples
- summary: key takeaways and core concept summary

Integration:
- Uses Google Gemini API if GEMINI_API_KEY is configured in backend settings.
- Automatically falls back to deterministic educational rule-based synthesis
  when offline or when GEMINI_API_KEY is omitted.
"""

import json
import urllib.error
import urllib.request
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models.lesson import Lesson


def _generate_deterministic_explanation(
    question: str,
    lesson: Lesson | None,
    mode: str,
) -> str:
    """Generate high-quality educational fallback responses tailored to mode."""
    mode = (mode or "standard").lower().strip()
    topic_context = lesson.title if lesson else "this topic"
    lesson_text = (
        lesson.simplified_content or lesson.standard_content
        if lesson
        else ""
    )

    if mode == "simplified":
        if lesson_text:
            first_sentence = lesson_text.split(".")[0].strip()
            return f"In simple words: {first_sentence}. {question.capitalize()} is easy to learn step by step."
        return f"In simple terms: {question} is an important concept in {topic_context}. Let's take it one step at a time."

    elif mode == "hint":
        if lesson:
            return f"Think about what you learned in '{lesson.title}'. Look at the key terms and how they connect to {question}."
        return f"Hint: Review the foundational concepts of {topic_context} to solve this question."

    elif mode == "example":
        if lesson:
            return f"Here is a real-world example for '{lesson.title}': Imagine using {topic_context} in everyday life, like sharing items equally or measuring objects."
        return f"Real-world example: Consider how {question} applies when observing nature or solving daily puzzles."

    elif mode == "summary":
        if lesson_text:
            return f"Summary of {topic_context}: {lesson_text[:200]}..."
        return f"Summary: {topic_context} focuses on understanding core principles and applying them accurately."

    # Standard mode
    if lesson_text:
        return f"Explanation for '{question}': Based on {topic_context}, {lesson_text}"
    return f"Explanation: {question} is a fundamental part of {topic_context}. Review the lesson materials to build full mastery."


def generate_ai_explanation(
    question: str,
    lesson_id: UUID | None,
    mode: str,
    db: Session,
) -> dict[str, Any]:
    """Generate an AI explanation with Gemini API and deterministic fallback."""
    lesson = None
    if lesson_id:
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    mode_clean = (mode or "standard").lower().strip()
    valid_modes = {"standard", "simplified", "hint", "example", "summary"}
    if mode_clean not in valid_modes:
        mode_clean = "standard"

    # Try Gemini API if key is available
    api_key = settings.GEMINI_API_KEY
    if api_key:
        try:
            prompt = (
                f"You are an accessible educational tutor for children. "
                f"Mode: {mode_clean}. "
                f"Lesson context: {lesson.title if lesson else 'General Learning'}. "
                f"Lesson content: {lesson.standard_content if lesson else ''}. "
                f"Student Question: {question}\n"
                f"Provide a friendly, helpful explanation matching the requested mode."
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
            req_data = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}]
            }).encode("utf-8")

            req = urllib.request.Request(
                url,
                data=req_data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                resp_json = json.loads(resp.read().decode("utf-8"))
                candidates = resp_json.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        ai_text = parts[0].get("text", "").strip()
                        if ai_text:
                            source_ids = [str(lesson.id)] if lesson else []
                            return {
                                "response": ai_text,
                                "source_ids": source_ids,
                                "mode": mode_clean,
                            }
        except Exception:
            # Fallback cleanly on network or API errors
            pass

    # Deterministic accessible synthesis fallback
    fallback_response = _generate_deterministic_explanation(question, lesson, mode_clean)
    source_ids = [str(lesson.id)] if lesson else []

    return {
        "response": fallback_response,
        "source_ids": source_ids,
        "mode": mode_clean,
    }
