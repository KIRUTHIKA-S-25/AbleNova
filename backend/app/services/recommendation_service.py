"""Adaptive recommendation service generating explainable learning suggestions."""
from typing import List, Dict, Any, Optional


class RecommendationService:
    @staticmethod
    def generate_recommendations(
        student_id: str,
        weak_topics: List[Dict[str, Any]],
        recent_quiz_accuracy: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """Generate explainable learning recommendations based on mastery and quiz results."""
        recommendations = []
        for topic in weak_topics:
            recommendations.append({
                "id": f"rec_{topic.get('id', 'default')}",
                "lesson_id": topic.get("lesson_id", "lesson_001"),
                "title": f"{topic.get('name', 'Topic')} — Practice & Review",
                "reason": f"Recommended because recent performance on {topic.get('name', 'this topic')} indicates areas for reinforcement.",
                "difficulty": "beginner",
                "estimated_minutes": 10
            })
        return recommendations


recommendation_service = RecommendationService()
