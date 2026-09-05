from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from athena_api.config import Settings
from athena_api.content import ContentLoader
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


def all_keys(value: Any) -> set[str]:
    if isinstance(value, dict):
        return set(value) | set().union(*(all_keys(item) for item in value.values()))
    if isinstance(value, list):
        return set().union(*(all_keys(item) for item in value))
    return set()


def test_lesson_endpoint_returns_canonical_public_contract(
    content_root: Path, tmp_path: Path
) -> None:
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        response = client.get("/v1/lessons/ch01-l01")

    assert response.status_code == 200
    payload = response.json()
    assert list(payload) == [
        "id",
        "title",
        "content_version",
        "status",
        "expert_reviewed_by",
        "blocks",
        "sources",
        "figures",
        "interactions",
        "exercises",
    ]
    assert payload["id"] == "ch01-l01"
    assert payload["title"] == "Gleiche Aufgabe, andere Reaktion"
    assert payload["content_version"] == "0.1.0"
    assert payload["status"] == "pilot_draft"
    assert payload["expert_reviewed_by"] is None

    block_text = []
    for block in payload["blocks"]:
        if block["kind"] == "heading":
            block_text.append(f'{"#" * block["level"]} {block["text"]}')
        elif block["kind"] == "paragraph":
            block_text.append(block["text"])
        else:
            block_text.append(f'[[{block["kind"]}:{block["id"]}]]')
    canonical = (content_root / "ch01" / "01_LOAD.md").read_text(encoding="utf-8")
    canonical_body = canonical.split("---", 2)[2].strip()
    assert "\n\n".join(block_text) == canonical_body
    assert [
        (block["kind"], block.get("id"))
        for block in payload["blocks"]
        if block["kind"] in {"figure", "interaction", "exercise"}
    ] == [
        ("figure", "fig-ch01-load"),
        ("interaction", "int-ch01-load"),
        ("exercise", "q-ch01-01"),
        ("exercise", "q-ch01-02"),
    ]

    assert [source["id"] for source in payload["sources"]] == ["S05", "S06"]
    for source in payload["sources"]:
        assert source["url"].startswith("https://")
        assert source["doi"]
        assert source["access_scope"]
        assert source["use_and_limits"]
        assert source["ingestion_policy"] == "metadata_and_original_notes_only"
        assert "additional_url" in source
        assert "checked_abstract_url" in source

    assert [figure["id"] for figure in payload["figures"]] == [
        "fig-ch01-load",
        "fig-ch01-two-runs",
    ]
    assert all(
        set(figure)
        == {
            "id",
            "learning_purpose",
            "alt_text",
            "long_description",
            "exact_labels",
            "source_ids",
            "status",
            "expert_review",
        }
        for figure in payload["figures"]
    )


def test_interaction_comes_from_canonical_interaction_spec(
    content_root: Path, tmp_path: Path
) -> None:
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        interaction = client.get("/v1/lessons/ch01-l01").json()["interactions"][0]

    assert interaction == {
        "id": "int-ch01-load",
        "figure_id": "fig-ch01-two-runs",
        "question": "Was kannst du allein aus diesen Angaben sagen?",
        "options": [
            {
                "id": "a",
                "text": "Die dokumentierten Merkmale der äußeren Aufgabe stimmen überein.",
                "feedback": "Die dokumentierten Merkmale stimmen überein. Jetzt kennst du zusätzlich eine unterschiedliche innere Reaktion. Warum sie verschieden war, ist noch offen.",
            },
            {
                "id": "b",
                "text": "Die innere Beanspruchung war sicher gleich.",
                "feedback": "Gleiche dokumentierte Strecken- und Zeitangaben reichen nicht für diese Aussage. Das aufgedeckte Erleben unterscheidet sich.",
            },
            {
                "id": "c",
                "text": "Die langfristige Anpassung wird gleich sein.",
                "feedback": "Eine langfristige Veränderung lässt sich aus diesem Vergleich nicht ablesen. Du kennst jetzt erst zwei unmittelbare Reaktionen.",
            },
        ],
        "runs": [
            {
                "id": "a",
                "distance": "zehn Kilometer",
                "duration": "sechzig Minuten",
                "route": "gleiche beschriebene flache Strecke",
                "reaction": "Angenehm erlebt.",
            },
            {
                "id": "b",
                "distance": "zehn Kilometer",
                "duration": "sechzig Minuten",
                "route": "gleiche beschriebene flache Strecke",
                "reaction": "Deutlich anstrengender erlebt.",
            },
        ],
        "reveal_action_label": "Reaktionen aufdecken",
        "reset_action_label": "Neu ansehen",
        "reflection_question": "Welche zusätzliche Information könnte bei der Einordnung helfen?",
        "reflection_text": "Weitere Aufgabenmerkmale, Kontext und Erfassung des Erlebens. Keine dieser Fragen beweist eine Ursache.",
        "source_ids": ["S05", "S06"],
    }


def test_exercises_expose_only_public_m0_fields(
    content_root: Path, tmp_path: Path
) -> None:
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        payload = client.get("/v1/lessons/ch01-l01").json()

    assert [exercise["id"] for exercise in payload["exercises"]] == [
        "q-ch01-01",
        "q-ch01-02",
    ]
    assert set(payload["exercises"][0]) == {
        "id",
        "kind",
        "prompt",
        "options",
        "objective_ids",
        "source_ids",
        "content_version",
        "development_status",
    }
    assert set(payload["exercises"][1]) == {
        "id",
        "kind",
        "prompt",
        "objective_ids",
        "source_ids",
        "content_version",
        "development_status",
    }
    assert [item["development_status"] for item in payload["exercises"]] == [
        "available",
        "in_development",
    ]
    assert not {
        "correct_option",
        "feedback_by_option",
        "rubric",
        "model_answer",
        "feedback",
        "misconception",
        "correct_mapping",
    } & all_keys(payload["exercises"])


def test_unknown_lesson_is_not_exposed(content_root: Path, tmp_path: Path) -> None:
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        response = client.get("/v1/lessons/ch01-l02")

    assert response.status_code == 404
    assert response.json() == {"detail": "Lektion nicht gefunden."}


def test_incomplete_m0_interaction_blocks_readiness(content_root: Path) -> None:
    path = content_root / "ch01" / "07_INTERACTIONS.md"
    text = path.read_text(encoding="utf-8")
    path.write_text(
        text.replace(
            "Rückmeldung für Auswahl 3: „Eine langfristige Veränderung lässt sich aus diesem Vergleich nicht ablesen. Du kennst jetzt erst zwei unmittelbare Reaktionen.“\n",
            "",
            1,
        ),
        encoding="utf-8",
    )

    result = ContentLoader(
        content_root, content_root.parent / "research" / "SOURCES.md"
    ).load()
    assert result.report.status == "failed"
    assert "invalid_interaction" in {issue.code for issue in result.report.issues}


@pytest.mark.parametrize("field", ["url", "additional_url", "checked_abstract_url"])
def test_source_urls_reject_non_http_schemes(content_root: Path, field: str) -> None:
    path = content_root.parent / "research" / "SOURCES.md"
    text = path.read_text(encoding="utf-8")
    s05_start = text.index("## S05")
    s06_start = text.index("## S06")
    section = text[s05_start:s06_start]
    if field == "url":
        section = section.replace(
            "url: https://pubmed.ncbi.nlm.nih.gov/30614348/",
            "url: file:///local/source",
            1,
        )
    else:
        section = section.replace(
            "doi: 10.1123/ijspp.2018-0935",
            f"doi: 10.1123/ijspp.2018-0935\n{field}: file:///local/source",
            1,
        )
    path.write_text(text[:s05_start] + section + text[s06_start:], encoding="utf-8")

    result = ContentLoader(content_root, path).load()
    assert result.report.status == "failed"
    assert any(
        issue.code == "schema_error" and field in issue.location
        for issue in result.report.issues
    )
