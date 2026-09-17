"""
AudienceIQ — Independent Evaluator Service

Waits for the API to become healthy, then runs a structured test suite
covering valid requests, invalid requests, and edge cases.

Writes /models/metrics.json with objective test results.
Does NOT fabricate metrics.
"""
from __future__ import annotations

import json
import logging
import os
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

try:
    import requests
except ImportError:
    import urllib.request
    import urllib.error

    class SimpleResponse:
        def __init__(self, status_code: int, content: bytes):
            self.status_code = status_code
            self.content = content
            self.text = content.decode("utf-8", errors="replace")

        def json(self):
            return json.loads(self.text)

    class SimpleRequests:
        class exceptions:
            class ConnectionError(Exception):
                pass

        @staticmethod
        def get(url: str, timeout: int = 10):
            req = urllib.request.Request(url, headers={"User-Agent": "AudienceIQ-Evaluator/1.0"})
            try:
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    return SimpleResponse(r.status, r.read())
            except urllib.error.HTTPError as e:
                return SimpleResponse(e.code, e.read())
            except (urllib.error.URLError, ConnectionRefusedError, OSError) as e:
                raise SimpleRequests.exceptions.ConnectionError(str(e))

        @staticmethod
        def post(url: str, json: Optional[Dict] = None, timeout: int = 10):
            data = None
            headers = {"User-Agent": "AudienceIQ-Evaluator/1.0"}
            if json is not None:
                import json as json_lib
                data = json_lib.dumps(json).encode("utf-8")
                headers["Content-Type"] = "application/json"
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    return SimpleResponse(r.status, r.read())
            except urllib.error.HTTPError as e:
                return SimpleResponse(e.code, e.read())
            except (urllib.error.URLError, ConnectionRefusedError, OSError) as e:
                raise SimpleRequests.exceptions.ConnectionError(str(e))

    requests = SimpleRequests()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger("evaluator")

API_BASE = os.getenv("API_BASE", "http://api:8000")
METRICS_PATH = os.getenv("METRICS_PATH", "/models/metrics.json")
MAX_WAIT_SECONDS = int(os.getenv("MAX_WAIT_SECONDS", "180"))
HEALTH_POLL_INTERVAL = int(os.getenv("HEALTH_POLL_INTERVAL", "5"))


# ---------------------------------------------------------------------------
# Test result structures
# ---------------------------------------------------------------------------

@dataclass
class TestResult:
    name: str
    passed: bool
    status_code: Optional[int]
    response_time_ms: float
    details: str
    response_body: Optional[Dict] = None


@dataclass
class EvaluationReport:
    evaluated_at: str
    api_base: str
    total_tests: int
    passed: int
    failed: int
    pass_rate: float
    avg_response_time_ms: float
    min_response_time_ms: float
    max_response_time_ms: float
    tests: List[Dict] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# API readiness wait
# ---------------------------------------------------------------------------

def wait_for_api() -> bool:
    """Poll /health until model_loaded=True or timeout."""
    logger.info("Waiting for API at %s …", API_BASE)
    deadline = time.time() + MAX_WAIT_SECONDS

    while time.time() < deadline:
        try:
            resp = requests.get(f"{API_BASE}/health", timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("model_loaded"):
                    logger.info("API ready — model_loaded=True")
                    return True
                else:
                    logger.info("API up but model not yet loaded (model_loaded=False)")
            else:
                logger.warning("Health check returned %d", resp.status_code)
        except requests.exceptions.ConnectionError:
            logger.info("API not yet reachable, retrying in %ds …", HEALTH_POLL_INTERVAL)
        except Exception as exc:
            logger.warning("Unexpected error polling health: %s", exc)

        time.sleep(HEALTH_POLL_INTERVAL)

    logger.error("Timed out waiting for API after %ds", MAX_WAIT_SECONDS)
    return False


# ---------------------------------------------------------------------------
# Test runner
# ---------------------------------------------------------------------------

def run_test(
    name: str,
    method: str,
    path: str,
    payload: Optional[Dict] = None,
    expected_status: int = 200,
    check_fn=None,
) -> TestResult:
    """Execute a single test case and return a TestResult."""
    url = f"{API_BASE}{path}"
    start = time.time()

    try:
        if method == "GET":
            resp = requests.get(url, timeout=10)
        elif method == "POST":
            resp = requests.post(url, json=payload, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")

        elapsed_ms = (time.time() - start) * 1000
        actual_status = resp.status_code

        try:
            body = resp.json()
        except Exception:
            body = {"raw": resp.text[:200]}

        # Status check
        status_ok = actual_status == expected_status

        # Optional custom check
        custom_ok = True
        custom_detail = ""
        if check_fn and status_ok:
            try:
                custom_ok, custom_detail = check_fn(body)
            except Exception as exc:
                custom_ok = False
                custom_detail = f"Check function error: {exc}"

        passed = status_ok and custom_ok

        if not status_ok:
            detail = f"Expected status {expected_status}, got {actual_status}"
        elif not custom_ok:
            detail = custom_detail
        else:
            detail = "OK"

        logger.info(
            "[%s] %s %s → %d (%.0fms) — %s",
            "PASS" if passed else "FAIL",
            method,
            path,
            actual_status,
            elapsed_ms,
            detail,
        )

        return TestResult(
            name=name,
            passed=passed,
            status_code=actual_status,
            response_time_ms=round(elapsed_ms, 2),
            details=detail,
            response_body=body,
        )

    except Exception as exc:
        elapsed_ms = (time.time() - start) * 1000
        logger.error("[FAIL] %s: %s", name, exc)
        return TestResult(
            name=name,
            passed=False,
            status_code=None,
            response_time_ms=round(elapsed_ms, 2),
            details=f"Request error: {exc}",
        )


# ---------------------------------------------------------------------------
# Test suite
# ---------------------------------------------------------------------------

def build_test_suite() -> List[Dict]:
    """Define all test cases. Returns list of dicts with test parameters."""
    return [
        # --- Health -----------------------------------------------------------
        {
            "name": "health_check_ok",
            "method": "GET", "path": "/health", "expected_status": 200,
            "check_fn": lambda b: (b.get("status") == "ok", f"status={b.get('status')}"),
        },
        {
            "name": "health_model_loaded",
            "method": "GET", "path": "/health", "expected_status": 200,
            "check_fn": lambda b: (b.get("model_loaded") is True, f"model_loaded={b.get('model_loaded')}"),
        },
        # --- Valid recommend --------------------------------------------------
        {
            "name": "recommend_valid_high_engagement",
            "method": "POST", "path": "/recommend", "expected_status": 200,
            "payload": {
                "user_id": "USR-EVAL-001",
                "watch_time_hours": 85.0,
                "top_genres": ["Action", "Thriller"],
                "avg_session_mins": 95.0,
            },
            "check_fn": lambda b: (
                "segment_id" in b and "recommendations" in b and len(b["recommendations"]) > 0,
                "Missing segment_id or empty recommendations"
            ),
        },
        {
            "name": "recommend_valid_casual",
            "method": "POST", "path": "/recommend", "expected_status": 200,
            "payload": {
                "user_id": "USR-EVAL-002",
                "watch_time_hours": 8.5,
                "top_genres": ["Comedy"],
                "avg_session_mins": 18.0,
            },
            "check_fn": lambda b: ("segment_name" in b, "Missing segment_name"),
        },
        {
            "name": "recommend_valid_multi_genre",
            "method": "POST", "path": "/recommend", "expected_status": 200,
            "payload": {
                "user_id": "USR-EVAL-003",
                "watch_time_hours": 42.0,
                "top_genres": ["Drama", "Romance", "Documentary"],
                "avg_session_mins": 55.0,
            },
            "check_fn": lambda b: ("distance_to_centroid" in b, "Missing distance_to_centroid"),
        },
        {
            "name": "recommend_response_schema_complete",
            "method": "POST", "path": "/recommend", "expected_status": 200,
            "payload": {
                "user_id": "USR-EVAL-004",
                "watch_time_hours": 32.5,
                "top_genres": ["Action", "Thriller"],
                "avg_session_mins": 85.0,
            },
            "check_fn": lambda b: (
                all(k in b for k in ["user_id", "segment_id", "segment_name", "recommendations", "distance_to_centroid"]),
                f"Missing required keys in response. Got: {list(b.keys())}"
            ),
        },
        # --- Invalid requests (validation errors) ----------------------------
        {
            "name": "recommend_missing_user_id",
            "method": "POST", "path": "/recommend", "expected_status": 422,
            "payload": {
                "watch_time_hours": 30.0,
                "top_genres": ["Drama"],
                "avg_session_mins": 45.0,
            },
        },
        {
            "name": "recommend_missing_genres",
            "method": "POST", "path": "/recommend", "expected_status": 422,
            "payload": {
                "user_id": "USR-BAD-001",
                "watch_time_hours": 30.0,
                "avg_session_mins": 45.0,
            },
        },
        {
            "name": "recommend_missing_watch_time",
            "method": "POST", "path": "/recommend", "expected_status": 422,
            "payload": {
                "user_id": "USR-BAD-002",
                "top_genres": ["Action"],
                "avg_session_mins": 45.0,
            },
        },
        {
            "name": "recommend_negative_watch_time",
            "method": "POST", "path": "/recommend", "expected_status": 422,
            "payload": {
                "user_id": "USR-BAD-003",
                "watch_time_hours": -5.0,
                "top_genres": ["Action"],
                "avg_session_mins": 45.0,
            },
        },
        {
            "name": "recommend_zero_watch_time",
            "method": "POST", "path": "/recommend", "expected_status": 422,
            "payload": {
                "user_id": "USR-BAD-004",
                "watch_time_hours": 0.0,
                "top_genres": ["Action"],
                "avg_session_mins": 45.0,
            },
        },
        {
            "name": "recommend_empty_genre_list",
            "method": "POST", "path": "/recommend", "expected_status": 422,
            "payload": {
                "user_id": "USR-BAD-005",
                "watch_time_hours": 30.0,
                "top_genres": [],
                "avg_session_mins": 45.0,
            },
        },
        {
            "name": "recommend_wrong_type_watch_time",
            "method": "POST", "path": "/recommend", "expected_status": 422,
            "payload": {
                "user_id": "USR-BAD-006",
                "watch_time_hours": "thirty",
                "top_genres": ["Action"],
                "avg_session_mins": 45.0,
            },
        },
        # --- Edge cases ------------------------------------------------------
        {
            "name": "recommend_very_large_watch_time",
            "method": "POST", "path": "/recommend", "expected_status": 422,
            "payload": {
                "user_id": "USR-EDGE-001",
                "watch_time_hours": 99999.0,
                "top_genres": ["Action"],
                "avg_session_mins": 45.0,
            },
        },
        {
            "name": "recommend_max_valid_watch_time",
            "method": "POST", "path": "/recommend", "expected_status": 200,
            "payload": {
                "user_id": "USR-EDGE-002",
                "watch_time_hours": 8760.0,
                "top_genres": ["Action"],
                "avg_session_mins": 60.0,
            },
        },
        {
            "name": "recommend_unknown_genres_still_processes",
            "method": "POST", "path": "/recommend", "expected_status": 200,
            "payload": {
                "user_id": "USR-EDGE-003",
                "watch_time_hours": 25.0,
                "top_genres": ["UnknownGenreXYZ", "AnotherFakeGenre"],
                "avg_session_mins": 40.0,
            },
        },
        {
            "name": "recommend_minimum_valid_watch_time",
            "method": "POST", "path": "/recommend", "expected_status": 200,
            "payload": {
                "user_id": "USR-EDGE-004",
                "watch_time_hours": 0.01,
                "top_genres": ["Drama"],
                "avg_session_mins": 1.0,
            },
        },
        # --- Other endpoints -------------------------------------------------
        {
            "name": "dashboard_returns_segments",
            "method": "GET", "path": "/dashboard", "expected_status": 200,
            "check_fn": lambda b: (
                "segments" in b and isinstance(b["segments"], list),
                "segments key missing or not a list"
            ),
        },
        {
            "name": "segments_list",
            "method": "GET", "path": "/segments", "expected_status": 200,
            "check_fn": lambda b: (isinstance(b, list) and len(b) > 0, "segments list empty"),
        },
        {
            "name": "model_info",
            "method": "GET", "path": "/model-info", "expected_status": 200,
            "check_fn": lambda b: (
                "selected_k" in b and b.get("model_loaded") is True,
                f"selected_k missing or model_loaded False: {b}"
            ),
        },
    ]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    logger.info("=== AudienceIQ Evaluator Starting ===")

    # Wait for API
    if not wait_for_api():
        # Write failure report
        report = EvaluationReport(
            evaluated_at=datetime.now(timezone.utc).isoformat(),
            api_base=API_BASE,
            total_tests=0,
            passed=0,
            failed=0,
            pass_rate=0.0,
            avg_response_time_ms=0.0,
            min_response_time_ms=0.0,
            max_response_time_ms=0.0,
            errors=["API did not become ready within timeout"],
        )
        _write_metrics(report)
        sys.exit(1)

    # Run test suite
    test_suite = build_test_suite()
    results: List[TestResult] = []

    logger.info("Running %d test cases …", len(test_suite))

    for tc in test_suite:
        result = run_test(
            name=tc["name"],
            method=tc["method"],
            path=tc["path"],
            payload=tc.get("payload"),
            expected_status=tc.get("expected_status", 200),
            check_fn=tc.get("check_fn"),
        )
        results.append(result)

    # Compute metrics
    passed = sum(1 for r in results if r.passed)
    failed = len(results) - passed
    response_times = [r.response_time_ms for r in results]

    report = EvaluationReport(
        evaluated_at=datetime.now(timezone.utc).isoformat(),
        api_base=API_BASE,
        total_tests=len(results),
        passed=passed,
        failed=failed,
        pass_rate=round(passed / len(results) * 100, 2) if results else 0.0,
        avg_response_time_ms=round(sum(response_times) / len(response_times), 2) if response_times else 0.0,
        min_response_time_ms=round(min(response_times), 2) if response_times else 0.0,
        max_response_time_ms=round(max(response_times), 2) if response_times else 0.0,
        tests=[{
            "name": r.name,
            "passed": r.passed,
            "status_code": r.status_code,
            "response_time_ms": r.response_time_ms,
            "details": r.details,
        } for r in results],
    )

    _write_metrics(report)

    logger.info("=== Evaluation Complete ===")
    logger.info("  Total : %d", report.total_tests)
    logger.info("  Passed: %d", report.passed)
    logger.info("  Failed: %d", report.failed)
    logger.info("  Pass%%: %.1f%%", report.pass_rate)
    logger.info("  Avg latency: %.0fms", report.avg_response_time_ms)

    if failed > 0:
        logger.warning("%d test(s) failed. See %s for details.", failed, METRICS_PATH)
        sys.exit(1)
    else:
        logger.info("All tests passed!")
        sys.exit(0)


def _write_metrics(report: EvaluationReport) -> None:
    from pathlib import Path
    Path(METRICS_PATH).parent.mkdir(parents=True, exist_ok=True)
    with open(METRICS_PATH, "w") as f:
        json.dump(asdict(report), f, indent=2)
    logger.info("Metrics written to %s", METRICS_PATH)


if __name__ == "__main__":
    main()
