from __future__ import annotations

import re
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


def set_content_version(content_root: Path, version: str) -> None:
    for path in (content_root / "ch01").glob("*.md"):
        text = path.read_text(encoding="utf-8")
        path.write_text(
            re.sub(
                r"(?m)^(\s*content_version:\s*)\S+\s*$",
                rf"\g<1>{version}",
                text,
            ),
            encoding="utf-8",
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
        "content_version": "0.2.0",
        "answer": {"option_id": option_id},
        "confidence": confidence,
        "mode": "practice",
        "assisted": False,
    }


def free_text_payload(
    *,
    attempt_id: str | None = None,
    text: str = "Distanz und Dauer sind gleich, das Erleben verschieden; die Ursache bleibt offen.",
    confidence: str | None = None,
) -> dict[str, object]:
    return {
        "attempt_id": attempt_id or str(uuid4()),
        "item_id": "q-ch01-02",
        "content_version": "0.2.0",
        "answer": {"text": text},
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
            "Eine stärkere akute Beanspruchung beweist keine bestimmte langfristige Anpassung.",
        ),
        (
            "b",
            "correct",
            "Richtig: Dokumentierte Aufgabe, beobachtete Reaktion und weitergehende Erklärung bleiben getrennt.",
        ),
        (
            "c",
            "incorrect",
            "Die Reaktion zeigt keine vollständige Gleichheit, beweist aber auch nicht, welches äußere Merkmal verschieden gewesen sein müsste.",
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


@pytest.mark.parametrize("item_id", ["q-ch01-03", "unknown"])
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
    payload["content_version"] = "0.1.0"
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
            "/v1/attempts", json={**payload, "content_version": "0.1.0"}
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
    set_content_version(content_root, "0.1.0")
    payload = {
        **attempt_payload(attempt_id=str(uuid4()), option_id="a"),
        "content_version": "0.1.0",
    }
    with TestClient(make_app(content_root, database_path)) as client:
        original = client.post("/v1/attempts", json=payload)
    assert original.status_code == 201

    questions_path = content_root / "ch01" / "05_QUESTIONS.md"
    questions_path.write_text(
        questions_path.read_text(encoding="utf-8")
        .replace("  correct_option: b", "  correct_option: a", 1)
        .replace(
            "Eine stärkere akute Beanspruchung beweist keine bestimmte langfristige Anpassung.",
            "Geändertes kanonisches Feedback.",
            1,
        ),
        encoding="utf-8",
    )
    set_content_version(content_root, "0.2.0")
    with TestClient(make_app(content_root, database_path)) as client:
        replay = client.post("/v1/attempts", json=payload)
        new_attempt = client.post(
            "/v1/attempts",
            json={
                **payload,
                "attempt_id": str(uuid4()),
                "content_version": "0.2.0",
            },
        )

    assert replay.status_code == new_attempt.status_code == 201
    assert replay.json() == original.json()
    assert new_attempt.json()["objective_result"] == "correct"
    assert new_attempt.json()["feedback"] == "Geändertes kanonisches Feedback."
    with sqlite3.connect(database_path) as connection:
        assert connection.execute("SELECT COUNT(*) FROM attempts").fetchone() == (2,)


def test_free_text_is_stored_before_canonical_solution_is_returned(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    payload = free_text_payload(confidence="sicher")
    with TestClient(make_app(content_root, database_path)) as client:
        response = client.post("/v1/attempts", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["answer"] == payload["answer"]
    assert body["objective_result"] == "not_assessed"
    assert body["grading_source"] == "self_assessment"
    assert body["model_answer"].startswith("Übung, Last, Sätze und Wiederholungen")
    assert [item["id"] for item in body["rubric"]] == ["c1", "c2", "c3"]
    assert all(item["required"] for item in body["rubric"])
    with sqlite3.connect(database_path) as connection:
        row = connection.execute(
            "SELECT answer_json, objective_result, grading_source, solution_json FROM attempts"
        ).fetchone()
    assert row[:3] == (
        '{"text":"Distanz und Dauer sind gleich, das Erleben verschieden; die Ursache bleibt offen."}',
        "not_assessed",
        "self_assessment",
    )
    assert "model_answer" in row[3]


@pytest.mark.parametrize(
    "text",
    ["", "   \n\t", "x" * 4_001, "🧪" * 4_001],
    ids=["empty", "whitespace", "ascii-overlong", "unicode-overlong"],
)
def test_free_text_rejects_blank_or_more_than_4000_unicode_characters(
    content_root: Path, tmp_path: Path, text: str
) -> None:
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        response = client.post("/v1/attempts", json=free_text_payload(text=text))
    assert response.status_code == 422


def test_free_text_accepts_4000_non_bmp_unicode_characters(
    content_root: Path, tmp_path: Path
) -> None:
    text = "🧪" * 4_000
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        response = client.post("/v1/attempts", json=free_text_payload(text=text))
    assert response.status_code == 201
    assert response.json()["answer"]["text"] == text


@pytest.mark.parametrize(
    "answer",
    [
        {"option_id": "b"},
        {"text": "Antwort", "extra": "forbidden"},
        {"text": 7},
    ],
)
def test_free_text_rejects_wrong_answer_shape(
    content_root: Path, tmp_path: Path, answer: dict[str, object]
) -> None:
    payload = free_text_payload()
    payload["answer"] = answer
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        response = client.post("/v1/attempts", json=payload)
    assert response.status_code == 422


def test_free_text_replay_and_new_attempt_are_independent(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    payload = free_text_payload(attempt_id=str(uuid4()))
    with TestClient(make_app(content_root, database_path)) as client:
        first = client.post("/v1/attempts", json=payload)
        replay = client.post("/v1/attempts", json=payload)
        conflict = client.post(
            "/v1/attempts", json={**payload, "answer": {"text": "Andere Antwort"}}
        )
        second = client.post(
            "/v1/attempts", json={**payload, "attempt_id": str(uuid4())}
        )
    assert first.status_code == replay.status_code == second.status_code == 201
    assert replay.json() == first.json()
    assert conflict.status_code == 409
    with sqlite3.connect(database_path) as connection:
        assert connection.execute("SELECT COUNT(*) FROM attempts").fetchone() == (2,)


def test_self_assessment_is_canonical_idempotent_and_persistent(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    set_content_version(content_root, "0.1.0")
    attempt = {
        **free_text_payload(attempt_id=str(uuid4())),
        "content_version": "0.1.0",
    }
    assessment = {
        "content_version": "0.1.0",
        "checked_criterion_ids": ["c1", "c2", "c3"],
        "rating": "good",
    }
    path = f"/v1/attempts/{attempt['attempt_id']}/self-assessment"
    with TestClient(make_app(content_root, database_path)) as client:
        assert client.post("/v1/attempts", json=attempt).status_code == 201
        first = client.post(path, json=assessment)
        replay = client.post(path, json=assessment)
        conflict = client.post(path, json={**assessment, "rating": "hard"})
    assert first.status_code == replay.status_code == 201
    assert replay.json() == first.json()
    assert first.json()["objective_result"] == "not_assessed"
    assert first.json()["grading_source"] == "self_assessment"
    assert conflict.status_code == 409

    set_content_version(content_root, "0.2.0")
    with TestClient(make_app(content_root, database_path)) as client:
        restarted = client.post(path, json=assessment)
        attempt_replay = client.post("/v1/attempts", json=attempt)
    assert restarted.json() == first.json()
    assert attempt_replay.status_code == 201
    with sqlite3.connect(database_path) as connection:
        assert connection.execute("SELECT COUNT(*) FROM self_assessments").fetchone() == (1,)


@pytest.mark.parametrize(
    ("assessment", "status"),
    [
        ({"content_version": "0.2.0", "checked_criterion_ids": ["unknown"], "rating": "hard"}, 422),
        ({"content_version": "0.2.0", "checked_criterion_ids": ["c1", "c1"], "rating": "hard"}, 422),
        ({"content_version": "0.2.0", "checked_criterion_ids": ["c1"], "rating": "good"}, 422),
        ({"content_version": "0.1.0", "checked_criterion_ids": [], "rating": "again"}, 409),
        ({"content_version": "0.2.0", "checked_criterion_ids": [], "rating": "great"}, 422),
        ({"content_version": "0.2.0", "checked_criterion_ids": [], "rating": "again", "extra": True}, 422),
    ],
)
def test_self_assessment_rejects_invalid_payload(
    content_root: Path, tmp_path: Path, assessment: dict[str, object], status: int
) -> None:
    attempt = free_text_payload()
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        client.post("/v1/attempts", json=attempt)
        response = client.post(
            f"/v1/attempts/{attempt['attempt_id']}/self-assessment", json=assessment
        )
    assert response.status_code == status


def test_self_assessment_rejects_unknown_and_choice_attempts(
    content_root: Path, tmp_path: Path
) -> None:
    choice = attempt_payload()
    assessment = {
        "content_version": "0.2.0",
        "checked_criterion_ids": [],
        "rating": "again",
    }
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        client.post("/v1/attempts", json=choice)
        choice_response = client.post(
            f"/v1/attempts/{choice['attempt_id']}/self-assessment", json=assessment
        )
        unknown_response = client.post(
            f"/v1/attempts/{uuid4()}/self-assessment", json=assessment
        )
    assert choice_response.status_code == 409
    assert unknown_response.status_code == 404
