from __future__ import annotations

import shutil
from pathlib import Path

import pytest


@pytest.fixture
def content_root(tmp_path: Path) -> Path:
    repository_root = Path(__file__).resolve().parents[3]
    shutil.copytree(repository_root / "content", tmp_path / "content")
    (tmp_path / "research").mkdir()
    shutil.copy2(repository_root / "research" / "SOURCES.md", tmp_path / "research")
    return tmp_path / "content"
