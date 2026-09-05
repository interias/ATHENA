from __future__ import annotations

import sqlite3
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from athena_api.config import Settings
from athena_api.main import create_app


def make_app(content_root: Path, database_path: Path):
    api_root = Path(__file__).resolve().parents[1]
    return create_app(
        Settings(
            content_root=content_root,
            sources_path=content_root.parent / "research" / "SOURCES.md",
            database_path=database_path,
            migrations_path=api_root / "migrations",
        )
    )


def attempt_payload(
    *,
    attempt_id: str | None = None,
    option_id: str = "b",
    confidence: str | None = "mittel",
) -> dict[str, object]:
    return {
        "attempt_id": attempt_id or str(uuid4()),
        "item_id": "q-ch01-01",
        "content_version": "0.1.0",
        "answer": {"option_id": option_id},
        "confidence": confidence,
        "mode": "practice",
        "assisted": False,
    }


@pytest.mark.parametrize(
    ("option_id", "objective_result", "feedback"),
    [
        (
            "a",
            "incorrect",
            "Das beschreibt dein Erleben, nicht die absolvierte Aufgabe.",
        ),
        (
            "b",
            "correct",
            "Richtig: Strecke und Dauer beschreiben einen dokumentierten Teil der Aufgabe.",
        ),
        (
            "c",
            "incorrect",
            "Zufriedenheit ist ein subjektives Urteil und kein Maß der Laufaufgabe.",
        ),
    ],
)
def test_attempt_is_graded_and_returns_canonical_feedback(
    content_root: Path,
    tmp_path: Path,
    option_id: str,
    objective_result: str,
    feedback: str,
) -> None:
    payload = attempt_payload(option_id=option_id)
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        response = client.post("/v1/attempts", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body == {
        **payload,
        "created_at": body["created_at"],
        "objective_result": objective_result,
        "grading_source": "canonical_single_choice",
        "feedback": feedback,
    }
    assert datetime.fromisoformat(body["created_at"]).utcoffset() == timedelta(0)


def test_confidence_may_be_omitted(content_root: Path, tmp_path: Path) -> None:
    payload = attempt_payload()
    del payload["confidence"]
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        response = client.post("/v1/attempts", json=payload)

    assert response.status_code == 201
    assert response.json()["confidence"] is None


@pytest.mark.parametrize("item_id", ["q-ch01-02", "q-ch01-03", "unknown"])
def test_attempt_rejects_unknown_or_not_enabled_items(
    content_root: Path, tmp_path: Path, item_id: str
) -> None:
    payload = attempt_payload()
    payload["item_id"] = item_id
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        response = client.post("/v1/attempts", json=payload)

    assert response.status_code == 404


def test_attempt_rejects_wrong_content_version(
    content_root: Path, tmp_path: Path
) -> None:
    payload = attempt_payload()
    payload["content_version"] = "0.0.9"
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        response = client.post("/v1/attempts", json=payload)

    assert response.status_code == 409


@pytest.mark.parametrize(
    "change",
    [
        lambda payload: payload.update(extra="forbidden"),
        lambda payload: payload["answer"].update(extra="forbidden"),
        lambda payload: payload.update(attempt_id="not-a-uuid"),
        lambda payload: payload.update(confidence="hoch"),
        lambda payload: payload.update(mode="review"),
        lambda payload: payload.update(assisted=1),
        lambda payload: payload.update(answer={"option_id": ""}),
        lambda payload: payload.update(answer={"option_id": "z"}),
        lambda payload: payload.update(item_id="x" * 65),
        lambda payload: payload.update(content_version="x" * 33),
        lambda payload: payload.update(answer={"option_id": "x" * 65}),
    ],
)
def test_attempt_rejects_invalid_or_extra_payload_fields(
    content_root: Path, tmp_path: Path, change
) -> None:
    payload = attempt_payload()
    change(payload)
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        response = client.post("/v1/attempts", json=payload)

    assert response.status_code == 422


def test_identical_replay_returns_exact_result_and_changed_payload_conflicts(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    payload = attempt_payload(attempt_id=str(uuid4()), confidence=None)
    with TestClient(make_app(content_root, database_path)) as client:
        first = client.post("/v1/attempts", json=payload)
        replay = client.post("/v1/attempts", json=payload)
        changed = client.post(
            "/v1/attempts", json={**payload, "answer": {"option_id": "a"}}
        )
        changed_version = client.post(
            "/v1/attempts", json={**payload, "content_version": "0.0.9"}
        )

    assert first.status_code == replay.status_code == 201
    assert replay.json() == first.json()
    assert changed.status_code == 409
    assert changed_version.status_code == 409
    with sqlite3.connect(database_path) as connection:
        assert connection.execute("SELECT COUNT(*) FROM attempts").fetchone() == (1,)
        row = connection.execute(
            "SELECT answer_json, confidence, objective_result, grading_source FROM attempts"
        ).fetchone()
    assert row == (
        '{"option_id":"b"}',
        None,
        "correct",
        "canonical_single_choice",
    )


def test_concurrent_identical_requests_create_one_attempt(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    payload = attempt_payload(attempt_id=str(uuid4()))
    with TestClient(make_app(content_root, database_path)) as client:
        with ThreadPoolExecutor(max_workers=2) as executor:
            responses = list(
                executor.map(
                    lambda _: client.post("/v1/attempts", json=payload), range(2)
                )
            )

    assert [response.status_code for response in responses] == [201, 201]
    assert responses[0].json() == responses[1].json()
    with sqlite3.connect(database_path) as connection:
        assert connection.execute("SELECT COUNT(*) FROM attempts").fetchone() == (1,)


def test_restart_replay_uses_persisted_grading_and_feedback_snapshot(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    payload = attempt_payload(attempt_id=str(uuid4()), option_id="a")
    with TestClient(make_app(content_root, database_path)) as client:
        original = client.post("/v1/attempts", json=payload)
    assert original.status_code == 201

    questions_path = content_root / "ch01" / "05_QUESTIONS.md"
    questions_path.write_text(
        questions_path.read_text(encoding="utf-8")
        .replace("  correct_option: b", "  correct_option: a", 1)
        .replace(
            "Das beschreibt dein Erleben, nicht die absolvierte Aufgabe.",
            "Geändertes kanonisches Feedback.",
            1,
        ),
        encoding="utf-8",
    )
    with TestClient(make_app(content_root, database_path)) as client:
        replay = client.post("/v1/attempts", json=payload)
        new_attempt = client.post(
            "/v1/attempts",
            json={**payload, "attempt_id": str(uuid4())},
        )

    assert replay.status_code == new_attempt.status_code == 201
    assert replay.json() == original.json()
    assert new_attempt.json()["objective_result"] == "correct"
    assert new_attempt.json()["feedback"] == "Geändertes kanonisches Feedback."
    with sqlite3.connect(database_path) as connection:
        assert connection.execute("SELECT COUNT(*) FROM attempts").fetchone() == (2,)
