from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class Settings:
    content_root: Path
    sources_path: Path
    database_path: Path
    migrations_path: Path

    @classmethod
    def from_env(cls) -> "Settings":
        api_root = Path(__file__).resolve().parents[2]
        repository_root = (
            api_root.parents[1] if len(api_root.parents) > 1 else api_root
        )
        content_root = os.environ.get("ATHENA_CONTENT_ROOT")
        sources_path = os.environ.get("ATHENA_SOURCES_PATH")
        return cls(
            content_root=(
                Path(content_root).resolve()
                if content_root is not None
                else repository_root / "content"
            ),
            sources_path=(
                Path(sources_path).resolve()
                if sources_path is not None
                else repository_root / "research" / "SOURCES.md"
            ),
            database_path=Path(
                os.environ.get(
                    "ATHENA_DATABASE_PATH", api_root / "data" / "athena.db"
                )
            ).resolve(),
            migrations_path=api_root / "migrations",
        )
