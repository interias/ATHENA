from __future__ import annotations

import hashlib
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

BUSY_TIMEOUT_MS = 5_000


class DatabaseError(RuntimeError):
    pass


class Database:
    def __init__(self, path: Path, migrations_path: Path):
        self.path = path
        self.migrations_path = migrations_path

    @contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.path, timeout=BUSY_TIMEOUT_MS / 1_000)
        try:
            connection.execute("PRAGMA foreign_keys = ON")
            connection.execute(f"PRAGMA busy_timeout = {BUSY_TIMEOUT_MS}")
            yield connection
        finally:
            connection.close()

    def migrate(self) -> None:
        migration_files = sorted(
            self.migrations_path.glob("[0-9][0-9][0-9]_*.sql")
        )
        if not migration_files:
            raise DatabaseError("Keine versionierten Migrationen gefunden.")
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as connection:
            self._ensure_migration_table(connection)
            applied = {
                row[0]: row[1]
                for row in connection.execute(
                    "SELECT version, checksum FROM schema_migrations"
                )
            }
            known_versions = {int(path.name.split("_", 1)[0]) for path in migration_files}
            unsupported = set(applied) - known_versions
            if unsupported:
                versions = ", ".join(str(version) for version in sorted(unsupported))
                raise DatabaseError(
                    f"Datenbank enthält nicht unterstützte Migrationen: {versions}."
                )
            for path in migration_files:
                version = int(path.name.split("_", 1)[0])
                sql = path.read_text(encoding="utf-8")
                checksum = hashlib.sha256(sql.encode("utf-8")).hexdigest()
                if version in applied:
                    if applied[version] != checksum:
                        raise DatabaseError(
                            f"Migration {version} wurde nach der Anwendung verändert."
                        )
                    continue
                self._apply_migration(connection, version, path.name, checksum, sql)

    @staticmethod
    def _ensure_migration_table(connection: sqlite3.Connection) -> None:
        connection.execute("BEGIN IMMEDIATE")
        try:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version INTEGER PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    checksum TEXT NOT NULL,
                    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            connection.commit()
        except Exception:
            connection.rollback()
            raise

    @staticmethod
    def _apply_migration(
        connection: sqlite3.Connection,
        version: int,
        name: str,
        checksum: str,
        sql: str,
    ) -> None:
        statements = [statement.strip() for statement in sql.split(";") if statement.strip()]
        connection.execute("BEGIN IMMEDIATE")
        try:
            for statement in statements:
                connection.execute(statement)
            connection.execute(
                "INSERT INTO schema_migrations(version, name, checksum) VALUES (?, ?, ?)",
                (version, name, checksum),
            )
            connection.commit()
        except Exception:
            connection.rollback()
            raise

    def check(self) -> None:
        with self.connect() as connection:
            if connection.execute("PRAGMA foreign_keys").fetchone() != (1,):
                raise DatabaseError("SQLite-Fremdschlüssel sind nicht aktiviert.")
            connection.execute("SELECT 1 FROM schema_migrations LIMIT 1").fetchall()
