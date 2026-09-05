from __future__ import annotations

import sqlite3
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
        assert connection.execute("PRAGMA user_version").fetchone() == (2,)
        assert connection.execute(
            "SELECT version, name FROM schema_migrations"
        ).fetchall() == [(1, "001_initial.sql"), (2, "002_attempts.sql")]

    with sqlite3.connect(database_path) as connection:
        tables = {
            row[0]
            for row in connection.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table'"
            )
        }
    assert tables == {"attempts", "schema_migrations"}

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
