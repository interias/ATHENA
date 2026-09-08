from __future__ import annotations

import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

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


def feedback_payload() -> dict[str, object]:
    return {
        "feedback_id": "1bdd73d8-964c-47ab-a78b-f1d55ea22d2f",
        "lesson_id": "ch01-l01",
        "content_version": "0.2.0",
        "readability": 4,
        "text_amount": 2,
        "visual_usefulness": 5,
        "practical_relevance": 3,
        "usability": 1,
        "reread_location": "Beim Übergang von äußerer zu innerer Belastung.",
        "clarifying_visual": "Die Gegenüberstellung der zwei Läufe 🙂",
    }


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


def test_pilot_feedback_is_stored_with_server_time_and_idempotent_snapshot(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    payload = feedback_payload()
    with TestClient(make_app(content_root, database_path)) as client:
        created = client.post("/v1/pilot-feedback", json=payload)
        assert created.status_code == 201
        assert created.json() == {
            **payload,
            "created_at": created.json()["created_at"],
        }
        created_at = datetime.fromisoformat(
            created.json()["created_at"].replace("Z", "+00:00")
        )
        assert created_at.tzinfo == timezone.utc

        retried = client.post("/v1/pilot-feedback", json=payload)
        assert retried.status_code == 201
        assert retried.json() == created.json()

    with sqlite3.connect(database_path) as connection:
        row = connection.execute(
            "SELECT id, lesson_id, content_version, ratings_json, free_text, created_at FROM pilot_feedback"
        ).fetchone()
        assert connection.execute("SELECT COUNT(*) FROM pilot_feedback").fetchone() == (1,)
    assert row[:-1] == (
        payload["feedback_id"],
        "ch01-l01",
        "0.2.0",
        '{"practical_relevance":3,"readability":4,"text_amount":2,"usability":1,"visual_usefulness":5}',
        '{"clarifying_visual":"Die Gegenüberstellung der zwei Läufe 🙂","reread_location":"Beim Übergang von äußerer zu innerer Belastung."}',
    )
    assert datetime.fromisoformat(row[-1]) == created_at


def test_same_feedback_id_rejects_a_changed_snapshot(
    content_root: Path, tmp_path: Path
) -> None:
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        payload = feedback_payload()
        assert client.post("/v1/pilot-feedback", json=payload).status_code == 201
        conflict = client.post(
            "/v1/pilot-feedback", json={**payload, "readability": 5}
        )
        assert conflict.status_code == 409
        assert "anderem Inhalt" in conflict.json()["detail"]


def test_old_feedback_snapshot_replays_after_content_version_changes(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    set_content_version(content_root, "0.1.0")
    payload = {**feedback_payload(), "content_version": "0.1.0"}
    with TestClient(make_app(content_root, database_path)) as client:
        original = client.post("/v1/pilot-feedback", json=payload)
    assert original.status_code == 201

    set_content_version(content_root, "0.2.0")
    with TestClient(make_app(content_root, database_path)) as client:
        replay = client.post("/v1/pilot-feedback", json=payload)
        changed_replay = client.post(
            "/v1/pilot-feedback", json={**payload, "readability": 5}
        )
        new_old_feedback = client.post(
            "/v1/pilot-feedback",
            json={
                **payload,
                "feedback_id": "e2e345d2-8271-49bb-a20f-59b94366e964",
            },
        )

    assert replay.status_code == 201
    assert replay.json() == original.json()
    assert changed_replay.status_code == 409
    assert new_old_feedback.status_code == 409
    with sqlite3.connect(database_path) as connection:
        assert connection.execute("SELECT COUNT(*) FROM pilot_feedback").fetchone() == (1,)


def test_later_feedback_with_a_new_uuid_is_allowed(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    with TestClient(make_app(content_root, database_path)) as client:
        first = feedback_payload()
        second = {
            **first,
            "feedback_id": "e2e345d2-8271-49bb-a20f-59b94366e964",
            "readability": 5,
        }
        assert client.post("/v1/pilot-feedback", json=first).status_code == 201
        assert client.post("/v1/pilot-feedback", json=second).status_code == 201
    with sqlite3.connect(database_path) as connection:
        assert connection.execute("SELECT COUNT(*) FROM pilot_feedback").fetchone() == (2,)


def test_pilot_feedback_validates_ratings_text_lesson_and_version(
    content_root: Path, tmp_path: Path
) -> None:
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        payload = feedback_payload()
        for changed in (
            {"readability": 0},
            {"readability": 6},
            {"readability": 4.0},
            {"readability": "4"},
            {"readability": True},
            {"readability": None},
            {"reread_location": "x" * 2_001},
            {"clarifying_visual": "nicht erlaubt\u0000"},
        ):
            assert client.post(
                "/v1/pilot-feedback", json={**payload, **changed}
            ).status_code == 422

        missing_rating = payload.copy()
        del missing_rating["usability"]
        assert client.post("/v1/pilot-feedback", json=missing_rating).status_code == 422
        assert client.post(
            "/v1/pilot-feedback", json={**payload, "lesson_id": "ch01-l03"}
        ).status_code == 404
        assert client.post(
            "/v1/pilot-feedback", json={**payload, "content_version": "0.1.0"}
        ).status_code == 409
        assert client.post(
            "/v1/pilot-feedback", json={**payload, "claimed_success": True}
        ).status_code == 422
