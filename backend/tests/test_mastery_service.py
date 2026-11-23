from app.services.mastery_service import mastery_service


def test_mastery_calculation_with_scores():
    recent_scores = [0.8, 0.9, 0.85]
    historical_accuracy = 0.75
    attempt_count = 5

    result = mastery_service.calculate_topic_mastery(
        recent_scores=recent_scores,
        historical_accuracy=historical_accuracy,
        attempt_count=attempt_count,
    )

    assert "mastery_score" in result
    assert "confidence" in result
    assert 0.0 <= result["mastery_score"] <= 1.0
    assert 0.0 <= result["confidence"] <= 1.0
    # With strong recent scores, mastery should be > 0.8
    assert result["mastery_score"] >= 0.8


def test_mastery_calculation_empty_scores():
    result = mastery_service.calculate_topic_mastery(
        recent_scores=[],
        historical_accuracy=0.6,
        attempt_count=0,
    )

    assert result["mastery_score"] == 0.6
    assert result["confidence"] == 0.2
