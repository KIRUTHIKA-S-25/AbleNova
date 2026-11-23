"""Transparent mastery calculation engine for AbleNova."""
from typing import Dict, Any, List


class MasteryService:
    @staticmethod
    def calculate_topic_mastery(
        recent_scores: List[float],
        historical_accuracy: float,
        attempt_count: int,
        consistency_factor: float = 1.0
    ) -> Dict[str, float]:
        """Calculates topic mastery score (0.0 to 1.0) and confidence.
        
        Formula:
        Weighted combination:
        - 60% recent quiz performance
        - 30% historical performance
        - 10% consistency & attempts factor
        """
        if not recent_scores:
            return {"mastery_score": historical_accuracy, "confidence": 0.2}

        recent_avg = sum(recent_scores) / len(recent_scores)
        mastery = (0.6 * recent_avg) + (0.3 * historical_accuracy) + (0.1 * min(1.0, attempt_count / 5.0))
        confidence = min(1.0, 0.3 + (attempt_count * 0.15))

        return {
            "mastery_score": round(max(0.0, min(1.0, mastery)), 2),
            "confidence": round(max(0.0, min(1.0, confidence)), 2)
        }


mastery_service = MasteryService()
