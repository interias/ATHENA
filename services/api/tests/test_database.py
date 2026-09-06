from __future__ import annotations

import sqlite3
import shutil
from pathlib import Path

import pytest

from athena_api.database import BUSY_TIMEOUT_MS, Database, DatabaseError


def test_migration_is_versioned_and_connection_enables_foreign_keys(
    tmp_path: Path,
) -> None:
    api_root = Path(__file__).resolve().parents[1]
    database_path = tmp_path / "nested" / "athena.db"
    database = Database(database_path, api_root / "migrations")

    database.migrate()
    database.migrate()

    with database.connect() as connection:
        assert connection.execute("PRAGMA foreign_keys").fetchone() == (1,)
        assert connection.execute("PRAGMA busy_timeout").fetchone() == (
            BUSY_TIMEOUT_MS,
        )
        assert connection.execute("PRAGMA user_version").fetchone() == (3,)
        assert connection.execute(
            "SELECT version, name FROM schema_migrations"
        ).fetchall() == [
            (1, "001_initial.sql"),
            (2, "002_attempts.sql"),
            (3, "003_free_text_attempts.sql"),
        ]

    with sqlite3.connect(database_path) as connection:
        tables = {
            row[0]
            for row in connection.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table'"
            )
        }
    assert tables == {"attempts", "schema_migrations", "self_assessments"}

    with sqlite3.connect(database_path) as connection:
        columns = {
            row[1]: row[2]
            for row in connection.execute("PRAGMA table_info(attempts)")
        }
    assert columns == {
        "id": "TEXT",
        "item_id": "TEXT",
        "content_version": "TEXT",
        "answer_json": "TEXT",
        "confidence": "TEXT",
        "mode": "TEXT",
        "assisted": "INTEGER",
        "created_at": "TEXT",
        "objective_result": "TEXT",
        "grading_source": "TEXT",
        "feedback": "TEXT",
        "solution_json": "TEXT",
    }


def test_unknown_future_migration_is_not_silently_accepted(tmp_path: Path) -> None:
    api_root = Path(__file__).resolve().parents[1]
    database_path = tmp_path / "athena.db"
    database = Database(database_path, api_root / "migrations")
    database.migrate()
    with database.connect() as connection:
        connection.execute(
            "INSERT INTO schema_migrations(version, name, checksum) VALUES (99, '099_future.sql', 'test')"
        )
        connection.commit()

    with pytest.raises(DatabaseError, match="nicht unterstützte Migrationen: 99"):
        database.migrate()


def test_migration_003_preserves_existing_v2_choice_attempt(tmp_path: Path) -> None:
    api_root = Path(__file__).resolve().parents[1]
    v2_migrations = tmp_path / "v2-migrations"
    v2_migrations.mkdir()
    for name in ("001_initial.sql", "002_attempts.sql"):
        shutil.copyfile(api_root / "migrations" / name, v2_migrations / name)
    database_path = tmp_path / "athena.db"
    Database(database_path, v2_migrations).migrate()
    original = (
        "0d0311df-5520-4db8-a227-fb957e793a7f",
        "q-ch01-01",
        "0.1.0",
        '{"option_id":"b"}',
        "sicher",
        "practice",
        0,
        "2026-09-05T10:20:30.123456+00:00",
        "correct",
        "canonical_single_choice",
        "Unveränderter Snapshot.",
    )
    with sqlite3.connect(database_path) as connection:
        connection.execute(
            "INSERT INTO attempts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", original
        )
        connection.commit()

    Database(database_path, api_root / "migrations").migrate()

    with sqlite3.connect(database_path) as connection:
        migrated = connection.execute(
            """
            SELECT id, item_id, content_version, answer_json, confidence, mode,
                   assisted, created_at, objective_result, grading_source, feedback,
                   solution_json
            FROM attempts
            """
        ).fetchone()
        foreign_keys = connection.execute("PRAGMA foreign_key_list(self_assessments)").fetchall()
    assert migrated == (*original, None)
    assert foreign_keys[0][2:7] == ("attempts", "attempt_id", "id", "NO ACTION", "CASCADE")
