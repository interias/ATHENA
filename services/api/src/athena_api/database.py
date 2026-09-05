from __future__ import annotations

import hashlib
import json
import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator

BUSY_TIMEOUT_MS = 5_000


class DatabaseError(RuntimeError):
    pass


class AttemptConflictError(DatabaseError):
    pass


@dataclass(frozen=True, slots=True)
class AttemptRecord:
    id: str
    item_id: str
    content_version: str
    answer_json: str
    confidence: str | None
    mode: str
    assisted: bool
    created_at: str
    objective_result: str
    grading_source: str
    feedback: str
    solution_json: str | None


@dataclass(frozen=True, slots=True)
class SelfAssessmentRecord:
    attempt_id: str
    content_version: str
    checked_criterion_ids_json: str
    rating: str
    created_at: str


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

    def save_attempt(
        self,
        *,
        attempt_id: str,
        item_id: str,
        content_version: str,
        answer: dict[str, str],
        confidence: str | None,
        mode: str,
        assisted: bool,
        objective_result: str,
        grading_source: str,
        feedback: str,
        solution: dict[str, object] | None = None,
    ) -> AttemptRecord:
        answer_json = json.dumps(
            answer,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        )
        request_values = (
            item_id,
            content_version,
            answer_json,
            confidence,
            mode,
            int(assisted),
        )
        solution_json = (
            json.dumps(solution, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)
            if solution is not None
            else None
        )
        with self.connect() as connection:
            connection.row_factory = sqlite3.Row
            connection.execute("BEGIN IMMEDIATE")
            try:
                existing = connection.execute(
                    "SELECT * FROM attempts WHERE id = ?", (attempt_id,)
                ).fetchone()
                if existing is not None:
                    stored_values = tuple(
                        existing[field]
                        for field in (
                            "item_id",
                            "content_version",
                            "answer_json",
                            "confidence",
                            "mode",
                            "assisted",
                        )
                    )
                    if stored_values != request_values:
                        raise AttemptConflictError(
                            "Die Versuch-ID wurde bereits mit anderem Inhalt verwendet."
                        )
                    connection.commit()
                    return self._attempt_record(existing)

                created_at = datetime.now(timezone.utc).isoformat(
                    timespec="microseconds"
                )
                connection.execute(
                    """
                    INSERT INTO attempts (
                        id, item_id, content_version, answer_json, confidence,
                        mode, assisted, created_at, objective_result, grading_source,
                        feedback, solution_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        attempt_id,
                        *request_values,
                        created_at,
                        objective_result,
                        grading_source,
                        feedback,
                        solution_json,
                    ),
                )
                stored = connection.execute(
                    "SELECT * FROM attempts WHERE id = ?", (attempt_id,)
                ).fetchone()
                connection.commit()
                if stored is None:
                    raise DatabaseError("Gespeicherter Versuch konnte nicht gelesen werden.")
                return self._attempt_record(stored)
            except Exception:
                connection.rollback()
                raise

    def find_attempt(
        self,
        *,
        attempt_id: str,
        item_id: str,
        content_version: str,
        answer: dict[str, str],
        confidence: str | None,
        mode: str,
        assisted: bool,
    ) -> AttemptRecord | None:
        answer_json = json.dumps(
            answer,
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
            allow_nan=False,
        )
        request_values = (
            item_id,
            content_version,
            answer_json,
            confidence,
            mode,
            int(assisted),
        )
        with self.connect() as connection:
            connection.row_factory = sqlite3.Row
            existing = connection.execute(
                "SELECT * FROM attempts WHERE id = ?", (attempt_id,)
            ).fetchone()
        if existing is None:
            return None
        stored_values = tuple(
            existing[field]
            for field in (
                "item_id",
                "content_version",
                "answer_json",
                "confidence",
                "mode",
                "assisted",
            )
        )
        if stored_values != request_values:
            raise AttemptConflictError(
                "Die Versuch-ID wurde bereits mit anderem Inhalt verwendet."
            )
        return self._attempt_record(existing)

    def get_attempt(self, attempt_id: str) -> AttemptRecord | None:
        with self.connect() as connection:
            connection.row_factory = sqlite3.Row
            row = connection.execute(
                "SELECT * FROM attempts WHERE id = ?", (attempt_id,)
            ).fetchone()
        return self._attempt_record(row) if row is not None else None

    def save_self_assessment(
        self,
        *,
        attempt_id: str,
        content_version: str,
        checked_criterion_ids: list[str],
        rating: str,
    ) -> SelfAssessmentRecord:
        checked_json = json.dumps(
            checked_criterion_ids,
            ensure_ascii=False,
            separators=(",", ":"),
            allow_nan=False,
        )
        request_values = (content_version, checked_json, rating)
        with self.connect() as connection:
            connection.row_factory = sqlite3.Row
            connection.execute("BEGIN IMMEDIATE")
            try:
                existing = connection.execute(
                    "SELECT * FROM self_assessments WHERE attempt_id = ?",
                    (attempt_id,),
                ).fetchone()
                if existing is not None:
                    stored_values = tuple(
                        existing[field]
                        for field in (
                            "content_version",
                            "checked_criterion_ids_json",
                            "rating",
                        )
                    )
                    if stored_values != request_values:
                        raise AttemptConflictError(
                            "Der Versuch wurde bereits anders selbst bewertet."
                        )
                    connection.commit()
                    return self._self_assessment_record(existing)

                created_at = datetime.now(timezone.utc).isoformat(timespec="microseconds")
                connection.execute(
                    """
                    INSERT INTO self_assessments (
                        attempt_id, content_version, checked_criterion_ids_json,
                        rating, created_at
                    ) VALUES (?, ?, ?, ?, ?)
                    """,
                    (attempt_id, *request_values, created_at),
                )
                stored = connection.execute(
                    "SELECT * FROM self_assessments WHERE attempt_id = ?",
                    (attempt_id,),
                ).fetchone()
                connection.commit()
                if stored is None:
                    raise DatabaseError("Selbstbewertung konnte nicht gelesen werden.")
                return self._self_assessment_record(stored)
            except Exception:
                connection.rollback()
                raise

    @staticmethod
    def _attempt_record(row: sqlite3.Row) -> AttemptRecord:
        return AttemptRecord(
            id=row["id"],
            item_id=row["item_id"],
            content_version=row["content_version"],
            answer_json=row["answer_json"],
            confidence=row["confidence"],
            mode=row["mode"],
            assisted=bool(row["assisted"]),
            created_at=row["created_at"],
            objective_result=row["objective_result"],
            grading_source=row["grading_source"],
            feedback=row["feedback"],
            solution_json=row["solution_json"],
        )

    @staticmethod
    def _self_assessment_record(row: sqlite3.Row) -> SelfAssessmentRecord:
        return SelfAssessmentRecord(
            attempt_id=row["attempt_id"],
            content_version=row["content_version"],
            checked_criterion_ids_json=row["checked_criterion_ids_json"],
            rating=row["rating"],
            created_at=row["created_at"],
        )
