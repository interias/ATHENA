from __future__ import annotations

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


def test_progress_marks_and_unmarks_current_lesson_idempotently(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    payload = {"content_version": "0.2.0", "read": True}
    with TestClient(make_app(content_root, database_path)) as client:
        initial = client.get("/v1/progress")
        assert initial.status_code == 200
        assert initial.json() == {
            "content_version": "0.2.0",
            "available_lessons": 1,
            "planned_lessons": 3,
            "read_lessons": 0,
            "lessons": [
                {
                    "lesson_id": "ch01-l01",
                    "content_version": "0.2.0",
                    "read": False,
                    "read_at": None,
                    "updated_at": None,
                }
            ],
        }

        marked = client.put("/v1/progress/ch01-l01", json=payload)
        assert marked.status_code == 200
        marked_body = marked.json()
        assert marked_body["read"] is True
        assert marked_body["read_at"] == marked_body["updated_at"]
        timestamp = datetime.fromisoformat(marked_body["read_at"].replace("Z", "+00:00"))
        assert timestamp.tzinfo == timezone.utc

        assert client.put("/v1/progress/ch01-l01", json=payload).json() == marked_body
        current = client.get("/v1/progress").json()
        assert current["read_lessons"] == 1
        assert current["lessons"] == [marked_body]

        unmarked = client.put(
            "/v1/progress/ch01-l01",
            json={"content_version": "0.2.0", "read": False},
        )
        assert unmarked.status_code == 200
        unmarked_body = unmarked.json()
        assert unmarked_body["read"] is False
        assert unmarked_body["read_at"] is None
        assert unmarked_body["updated_at"] != marked_body["updated_at"]
        assert client.put(
            "/v1/progress/ch01-l01",
            json={"content_version": "0.2.0", "read": False},
        ).json() == unmarked_body
        assert client.get("/v1/progress").json()["read_lessons"] == 0


def test_progress_rejects_unavailable_ids_versions_and_invalid_payloads(
    content_root: Path, tmp_path: Path
) -> None:
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        payload = {"content_version": "0.2.0", "read": True}
        assert client.put("/v1/progress/ch01-l02", json=payload).status_code == 404
        assert client.put("/v1/progress/unknown", json=payload).status_code == 404
        assert client.put(
            "/v1/progress/ch01-l01",
            json={"content_version": "0.1.0", "read": True},
        ).status_code == 409
        assert client.put(
            "/v1/progress/ch01-l01",
            json={"content_version": "0.2.0", "read": "true"},
        ).status_code == 422
        assert client.put(
            "/v1/progress/ch01-l01",
            json={**payload, "competence": 100},
        ).status_code == 422


def test_old_content_version_is_preserved_without_becoming_current_progress(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    with TestClient(make_app(content_root, database_path)) as client:
        with sqlite3.connect(database_path) as connection:
            connection.execute(
                "INSERT INTO lesson_progress VALUES (?, ?, ?, ?)",
                (
                    "ch01-l01",
                    "0.1.0",
                    "2026-09-01T10:00:00.000000+00:00",
                    "2026-09-01T10:00:00.000000+00:00",
                ),
            )
            connection.commit()

        current = client.get("/v1/progress").json()
        assert current["read_lessons"] == 0
        assert current["lessons"][0]["read"] is False

    with sqlite3.connect(database_path) as connection:
        assert connection.execute(
            "SELECT lesson_id, content_version, read_at FROM lesson_progress"
        ).fetchall() == [
            (
                "ch01-l01",
                "0.1.0",
                "2026-09-01T10:00:00.000000+00:00",
            )
        ]


def test_unmarking_progress_does_not_change_attempt_or_self_assessment(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    with TestClient(make_app(content_root, database_path)) as client:
        with sqlite3.connect(database_path) as connection:
            connection.execute(
                """
                INSERT INTO attempts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "0d0311df-5520-4db8-a227-fb957e793a7f",
                    "q-ch01-02",
                    "0.1.0",
                    '{"text":"Meine Antwort"}',
                    "mittel",
                    "practice",
                    0,
                    "2026-09-05T10:20:30.123456+00:00",
                    "not_assessed",
                    "self_assessment",
                    "Vergleiche deine Antwort.",
                    '{"model_answer":"Muster","rubric":[]}',
                ),
            )
            connection.execute(
                "INSERT INTO self_assessments VALUES (?, ?, ?, ?, ?)",
                (
                    "0d0311df-5520-4db8-a227-fb957e793a7f",
                    "0.1.0",
                    "[]",
                    "hard",
                    "2026-09-05T10:21:00.123456+00:00",
                ),
            )
            connection.commit()
            before = connection.execute(
                "SELECT * FROM attempts JOIN self_assessments ON attempts.id = self_assessments.attempt_id"
            ).fetchone()

        assert client.put(
            "/v1/progress/ch01-l01",
            json={"content_version": "0.2.0", "read": True},
        ).status_code == 200
        assert client.put(
            "/v1/progress/ch01-l01",
            json={"content_version": "0.2.0", "read": False},
        ).status_code == 200

        with sqlite3.connect(database_path) as connection:
            after = connection.execute(
                "SELECT * FROM attempts JOIN self_assessments ON attempts.id = self_assessments.attempt_id"
            ).fetchone()
        assert after == before
