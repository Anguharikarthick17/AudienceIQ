"""
AudienceIQ — Automated Test Suite for Advanced Intelligence Features

Direct execution and integration testing of the 5 differentiating features:
1. valid counterfactual
2. extreme counterfactual
3. missing counterfactual field
4. unknown genre
5. contradiction detection
6. clean profile with no contradiction
7. migration with temporal data check
8. counterfactual migration fallback
9. content gap calculation
10. catalog data handling
11. recommendation explanation (Why and Why-Not)
12. invalid recommendation input

Also verifies:
- GET /health
- POST /recommend
"""
import asyncio
import unittest
import sys
from pathlib import Path

# Add backend to path
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from pydantic import ValidationError
from app.state import app_state
from app.routers.health import health
from app.routers.recommend import recommend
from app.routers.advanced_intelligence import (
    simulate_counterfactual,
    detect_contradictions,
    get_migration_map,
    get_content_gaps,
    explain_recommendations,
)
from app.models import RecommendRequest
from app.models_advanced import (
    ProfileInput,
    CounterfactualRequest,
    ContradictionRequest,
    ExplainRecommendationRequest,
)


class TestAdvancedIntelligence(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        loaded = app_state.load_model()
        if not loaded:
            raise RuntimeError("Failed to load model in test setup.")

    def test_00_health_endpoint(self):
        """GET /health must return status ok and model_loaded=True."""
        resp = asyncio.run(health())
        self.assertEqual(resp.status, "ok")
        self.assertTrue(resp.model_loaded)
        self.assertEqual(resp.n_clusters, 2)
        self.assertEqual(resp.n_training_users, 2000)

    def test_00_recommend_existing_endpoint(self):
        """POST /recommend existing endpoint must continue functioning without regression."""
        req = RecommendRequest(
            user_id="TEST_REGRESSION",
            watch_time_hours=85.0,
            top_genres=["Action", "Sci-Fi"],
            avg_session_mins=90.0,
        )
        resp = asyncio.run(recommend(req))
        self.assertIn(resp.segment_id, [0, 1])
        self.assertGreater(len(resp.recommendations), 0)
        self.assertGreater(resp.distance_to_centroid, 0)
        self.assertIn("segment", resp.explanation.lower())

    # 1. valid counterfactual
    def test_01_valid_counterfactual(self):
        """Test valid counterfactual simulation between casual and high engagement."""
        req = CounterfactualRequest(
            original_profile=ProfileInput(
                watch_time_hours=25.0,
                avg_session_mins=30.0,
                top_genres=["Comedy"],
                sessions_per_week=3.0,
                completion_rate=0.45,
            ),
            counterfactual_profile=ProfileInput(
                watch_time_hours=120.0,
                avg_session_mins=115.0,
                top_genres=["Action", "Sci-Fi"],
                sessions_per_week=9.0,
                completion_rate=0.85,
            ),
        )
        resp = asyncio.run(simulate_counterfactual(req))
        self.assertEqual(resp.classification, "SIMULATED / COUNTERFACTUAL")
        self.assertIn("COUNTERFACTUAL SIMULATION — NOT CAUSAL INFERENCE", resp.disclaimer)
        self.assertEqual(resp.original.segment_id, 1)  # Genre Explorers
        self.assertEqual(resp.counterfactual.segment_id, 0)  # High-Engagement Genre Explorers
        self.assertTrue(resp.segment_transition.changed)
        self.assertGreater(len(resp.changed_features), 0)
        self.assertIn("mathematical drivers", resp.explanation.lower())

    # 2. extreme counterfactual
    def test_02_extreme_counterfactual(self):
        """Test extreme counterfactual values are safely bounded without error or NaN."""
        req = CounterfactualRequest(
            original_profile=ProfileInput(
                watch_time_hours=10.0,
                avg_session_mins=15.0,
                top_genres=["Drama"],
            ),
            counterfactual_profile=ProfileInput(
                watch_time_hours=5000.0,  # Extreme watch time
                avg_session_mins=1000.0,  # Extreme session
                top_genres=["Action"],
                sessions_per_week=45.0,
                completion_rate=0.99,
            ),
        )
        resp = asyncio.run(simulate_counterfactual(req))
        self.assertIsNotNone(resp.counterfactual.distance_to_centroid)
        self.assertFalse(any(v is None for v in resp.counterfactual.all_distances.values()))

    # 3. missing counterfactual field
    def test_03_missing_counterfactual_field(self):
        """Test that missing required fields fail schema validation with ValidationError."""
        with self.assertRaises(ValidationError):
            ProfileInput(
                watch_time_hours=20.0,
                # avg_session_mins is required and omitted
                top_genres=["Comedy"],
            )

    # 4. unknown genre
    def test_04_unknown_genre_handling(self):
        """Unknown genre should be safely normalized/handled without crashing model inference."""
        req = CounterfactualRequest(
            original_profile=ProfileInput(
                watch_time_hours=30.0,
                avg_session_mins=40.0,
                top_genres=["KlingonOpera", "UnderwaterBasketWeaving"],
            ),
            counterfactual_profile=ProfileInput(
                watch_time_hours=90.0,
                avg_session_mins=80.0,
                top_genres=["CyberpunkPostRock"],
            ),
        )
        resp = asyncio.run(simulate_counterfactual(req))
        self.assertIsNotNone(resp.counterfactual.segment_id)
        self.assertIn(resp.counterfactual.segment_id, [0, 1])

    # 5. contradiction detection
    def test_05_contradiction_detection(self):
        """Contradiction detector flags inconsistent profile (high watch time + 10m micro-sessions)."""
        req = ContradictionRequest(
            profile=ProfileInput(
                watch_time_hours=120.0,
                avg_session_mins=10.0,
                top_genres=["Drama"],
                completion_rate=0.05,
                sessions_per_week=8.0,
                days_since_last_watch=28.0,
            )
        )
        resp = asyncio.run(detect_contradictions(req))
        self.assertTrue(resp.contradictions_detected)
        self.assertGreater(resp.total_contradictions, 0)
        severities = [item.severity for item in resp.items]
        self.assertIn("HIGH", severities)
        self.assertEqual(resp.label, "Rule-based behavioral inconsistency indicator")

    # 6. clean profile with no contradiction
    def test_06_clean_profile_no_contradiction(self):
        """Clean profile with typical coherent values reports zero contradictions."""
        req = ContradictionRequest(
            profile=ProfileInput(
                watch_time_hours=45.0,
                avg_session_mins=50.0,
                top_genres=["Action", "Thriller"],
                sessions_per_week=4.0,
                completion_rate=0.70,
                days_since_last_watch=3.0,
                weekend_activity_ratio=0.50,
            )
        )
        resp = asyncio.run(detect_contradictions(req))
        self.assertFalse(resp.contradictions_detected)
        self.assertEqual(resp.total_contradictions, 0)

    # 7 & 8. migration check and counterfactual migration fallback
    def test_07_and_08_migration_fallback(self):
        """Migration endpoint detects absence of temporal data and provides counterfactual migration."""
        resp = asyncio.run(get_migration_map())
        self.assertFalse(resp.temporal_data_available)
        self.assertEqual(resp.mode, "COUNTERFACTUAL_AUDIENCE_MIGRATION")
        self.assertEqual(resp.badge, "SIMULATED TRANSITION — NOT HISTORICAL MIGRATION")
        self.assertIn("Not available in supplied dataset", resp.data_limitation_notice)
        self.assertEqual(len(resp.pathways), 2)
        for pathway in resp.pathways:
            self.assertIn("watch_time_hours", pathway.feature_shifts)
            self.assertIn("avg_session_mins", pathway.feature_shifts)

    # 9 & 10. content gap calculation and catalog handling
    def test_09_and_10_content_gaps(self):
        """Content gaps endpoint calculates demand vs catalog coverage with data honesty disclaimer."""
        resp = asyncio.run(get_content_gaps())
        self.assertFalse(resp.exposure_measured)
        self.assertIn("exposure is not measured in the supplied dataset", resp.data_honesty_statement)
        self.assertEqual(resp.classification_map["audience_demand"], "OBSERVED")
        self.assertEqual(resp.classification_map["catalog_coverage"], "OBSERVED")
        self.assertEqual(resp.classification_map["coverage_gap"], "INFERRED")
        self.assertEqual(resp.classification_map["user_exposure"], "Not available in supplied dataset.")
        self.assertGreater(len(resp.genre_gaps), 0)
        self.assertIn("Action", [g.genre for g in resp.genre_gaps])

    # 11. recommendation explanation (Why and Why-Not)
    def test_11_recommendation_explanation(self):
        """POST /recommend/explain returns dual explanations: recommended and not prioritized."""
        req = ExplainRecommendationRequest(
            user_id="TEST_WHY_NOT",
            watch_time_hours=95.0,
            avg_session_mins=105.0,
            top_genres=["Action", "Sci-Fi"],
        )
        resp = asyncio.run(explain_recommendations(req))
        self.assertEqual(resp.user_id, "TEST_WHY_NOT")
        self.assertGreater(len(resp.recommended_items), 0)
        self.assertGreater(len(resp.not_prioritized_items), 0)

        # Check recommended item has reasons starting with ✓
        rec = resp.recommended_items[0]
        self.assertEqual(rec.status, "RECOMMENDED")
        self.assertTrue(any(r.startswith("✓") for r in rec.reasons))

        # Check not-prioritized item has reasons starting with ○
        dep = resp.not_prioritized_items[0]
        self.assertEqual(dep.status, "NOT_PRIORITIZED")
        self.assertTrue(any(r.startswith("○") for r in dep.reasons))

    # 12. invalid recommendation input
    def test_12_invalid_recommendation_input(self):
        """POST /recommend/explain with invalid watch time raises ValidationError."""
        with self.assertRaises(ValidationError):
            ExplainRecommendationRequest(
                user_id="TEST_INVALID",
                watch_time_hours=-10.0,  # Negative watch time fails validation
                avg_session_mins=60.0,
                top_genres=["Action"],
            )


if __name__ == "__main__":
    unittest.main()
