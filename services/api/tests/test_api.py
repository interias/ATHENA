from __future__ import annotations

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


def test_default_content_paths_resolve_to_repository(monkeypatch) -> None:
    monkeypatch.delenv("ATHENA_CONTENT_ROOT", raising=False)
    monkeypatch.delenv("ATHENA_SOURCES_PATH", raising=False)
    repository_root = Path(__file__).resolve().parents[3]
    settings = Settings.from_env()
    assert settings.content_root == repository_root / "content"
    assert settings.sources_path == repository_root / "research" / "SOURCES.md"


def test_content_and_source_paths_are_configured_separately(
    monkeypatch, tmp_path: Path
) -> None:
    content_path = tmp_path / "mounted-content"
    sources_path = tmp_path / "mounted-research" / "SOURCES.md"
    monkeypatch.setenv("ATHENA_CONTENT_ROOT", str(content_path))
    monkeypatch.setenv("ATHENA_SOURCES_PATH", str(sources_path))
    settings = Settings.from_env()
    assert settings.content_root == content_path
    assert settings.sources_path == sources_path


def test_health_readiness_and_curriculum_use_canonical_content(
    content_root: Path, tmp_path: Path
) -> None:
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        assert client.get("/healthz").json() == {"status": "ok"}
        ready = client.get("/readyz")
        assert ready.status_code == 200
        assert ready.json()["status"] == "ready"

        response = client.get("/v1/curriculum")
        assert response.status_code == 200
        payload = response.json()
        assert payload["content_version"] == "0.3.0"
        chapter = payload["chapters"][0]
        assert chapter["order"] == 1
        assert chapter["title"] == "Wie Training wirkt"
        assert [lesson["order"] for lesson in chapter["lessons"]] == [1, 2, 3, 4, 6]
        assert [lesson["title"] for lesson in chapter["lessons"]] == [
            "Gleiche Aufgabe, andere Reaktion",
            "Anpassung braucht eine Zielgröße",
            "Progression ohne Tagesrekord",
            "Ein schlechter Tag ist kein Rückschritt-Beweis",
            "Beobachten, ohne sich Geschichten zu erzählen",
        ]
        assert [lesson["availability"] for lesson in chapter["lessons"]] == [
            "available",
            "available",
            "available",
            "planned",
            "planned",
        ]


def test_invalid_content_keeps_process_healthy_and_blocks_readiness(
    content_root: Path, tmp_path: Path
) -> None:
    lesson = content_root / "ch01" / "02_ADAPTATION.md"
    lesson.write_text(
        lesson.read_text(encoding="utf-8").replace("[S34, S35]", "[S99]", 1),
        encoding="utf-8",
    )
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        assert client.get("/healthz").status_code == 200
        response = client.get("/readyz")
        assert response.status_code == 503
        body = response.json()
        assert body["status"] == "not_ready"
        assert any(
            issue["code"] == "invalid_reference"
            and "S99" in issue["message"]
            for issue in body["checks"]["content"]["issues"]
        )
        assert client.get("/v1/curriculum").status_code == 503


def test_database_failure_keeps_process_healthy_and_blocks_readiness(
    content_root: Path, tmp_path: Path
) -> None:
    with TestClient(make_app(content_root, tmp_path)) as client:
        assert client.get("/healthz").status_code == 200
        response = client.get("/readyz")
        assert response.status_code == 503
        database_check = response.json()["checks"]["database"]
        assert database_check["status"] == "failed"
        assert database_check["issues"][0]["code"] == "database_unavailable"
