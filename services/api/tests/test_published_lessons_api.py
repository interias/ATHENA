from __future__ import annotations

import sqlite3
from pathlib import Path
from uuid import uuid4

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


def test_only_registered_lessons_and_exercises_are_published(
    content_root: Path, tmp_path: Path
) -> None:
    with TestClient(make_app(content_root, tmp_path / "athena.db")) as client:
        curriculum = client.get("/v1/curriculum")
        assert curriculum.status_code == 200
        lessons = curriculum.json()["chapters"][0]["lessons"]
        assert [
            lesson["id"] for lesson in lessons if lesson["availability"] == "available"
        ] == ["ch01-l01", "ch01-l02", "ch01-l05"]
        versions = {lesson["id"]: lesson["content_version"] for lesson in lessons}
        assert {lesson_id: versions[lesson_id] for lesson_id in (
            "ch01-l01", "ch01-l02", "ch01-l05"
        )} == {
            "ch01-l01": "0.2.0",
            "ch01-l02": "0.3.0",
            "ch01-l05": "0.3.0",
        }

        for lesson_id, exercise_id in (
            ("ch01-l02", "q-ch01-04"),
            ("ch01-l05", "q-ch01-05"),
        ):
            response = client.get(f"/v1/lessons/{lesson_id}")
            assert response.status_code == 200
            payload = response.json()
            assert [exercise["id"] for exercise in payload["exercises"]] == [
                exercise_id
            ]
            assert any(
                block["kind"] == "ordered_list" and len(block["items"]) == 3
                for block in payload["blocks"]
            )
            serialized = str(payload["exercises"])
            for solution_field in (
                "correct_option",
                "feedback_by_option",
                "model_answer",
                "rubric",
                "misconception",
            ):
                assert solution_field not in serialized

        assert client.get("/v1/lessons/ch01-l03").status_code == 404
        assert client.get("/v1/lessons/ch01-l04").status_code == 404
        assert client.get("/v1/lessons/%2e%2e%2freadyz").status_code == 404

        pilot = client.get("/v1/lessons/ch01-l01").json()
        assert {interaction["figure_id"] for interaction in pilot["interactions"]} == {
            figure["id"] for figure in pilot["figures"]
        }


def test_l2_version_change_preserves_independent_l1_state_and_history(
    content_root: Path, tmp_path: Path
) -> None:
    database_path = tmp_path / "athena.db"
    feedback_id = str(uuid4())
    attempt_id = str(uuid4())
    with TestClient(make_app(content_root, database_path)) as client:
        assert client.put(
            "/v1/progress/ch01-l01",
            json={"content_version": "0.2.0", "read": True},
        ).status_code == 200
        assert client.put(
            "/v1/progress/ch01-l02",
            json={"content_version": "0.3.0", "read": True},
        ).status_code == 200
        assert client.post(
            "/v1/attempts",
            json={
                "attempt_id": attempt_id,
                "item_id": "q-ch01-01",
                "content_version": "0.2.0",
                "answer": {"option_id": "b"},
                "confidence": None,
                "mode": "practice",
                "assisted": False,
            },
        ).status_code == 201
        assert client.post(
            "/v1/pilot-feedback",
            json={
                "feedback_id": feedback_id,
                "lesson_id": "ch01-l01",
                "content_version": "0.2.0",
                "readability": 4,
                "text_amount": 4,
                "visual_usefulness": 4,
                "practical_relevance": 4,
                "usability": 4,
                "reread_location": "",
                "clarifying_visual": "",
            },
        ).status_code == 201

    lesson_path = content_root / "ch01" / "02_ADAPTATION.md"
    lesson_path.write_text(
        lesson_path.read_text(encoding="utf-8").replace(
            "content_version: 0.3.0", "content_version: 0.3.1", 1
        ),
        encoding="utf-8",
    )
    questions_path = content_root / "ch01" / "05_QUESTIONS.md"
    questions = questions_path.read_text(encoding="utf-8")
    for question_id, next_question_id in (
        ("q-ch01-04", "q-ch01-05"),
        ("q-ch01-06", "q-ch01-07"),
    ):
        question_start = questions.index(f"- id: {question_id}")
        question_end = questions.index(f"- id: {next_question_id}")
        question = questions[question_start:question_end].replace(
            "content_version: 0.3.0", "content_version: 0.3.1", 1
        )
        questions = questions[:question_start] + question + questions[question_end:]
    questions_path.write_text(questions, encoding="utf-8")

    with TestClient(make_app(content_root, database_path)) as client:
        response = client.get("/v1/progress")
        assert response.status_code == 200
        current = {item["lesson_id"]: item for item in response.json()["lessons"]}
        assert current["ch01-l01"]["read"] is True
        assert current["ch01-l01"]["content_version"] == "0.2.0"
        assert current["ch01-l02"]["read"] is False
        assert current["ch01-l02"]["content_version"] == "0.3.1"

    with sqlite3.connect(database_path) as connection:
        assert connection.execute(
            "SELECT lesson_id, content_version FROM lesson_progress ORDER BY lesson_id"
        ).fetchall() == [("ch01-l01", "0.2.0"), ("ch01-l02", "0.3.0")]
        assert connection.execute("SELECT COUNT(*) FROM attempts").fetchone() == (1,)
        assert connection.execute("SELECT COUNT(*) FROM pilot_feedback").fetchone() == (
            1,
        )


def test_published_interaction_figure_dependency_is_required(
    content_root: Path,
) -> None:
    lesson_path = content_root / "ch01" / "01_LOAD.md"
    lesson_path.write_text(
        lesson_path.read_text(encoding="utf-8").replace(
            "figure_ids:\n- fig-ch01-two-runs\n", "figure_ids: []\n", 1
        ),
        encoding="utf-8",
    )

    result = ContentLoader(
        content_root, content_root.parent / "research" / "SOURCES.md"
    ).load()
    assert result.report.status == "failed"
    assert any(
        issue.code == "invalid_published_figures"
        and issue.location == "ch01-l01"
        for issue in result.report.issues
    )


def test_published_matching_question_fails_closed_while_planned_matching_is_valid(
    content_root: Path,
) -> None:
    questions_path = content_root / "ch01" / "05_QUESTIONS.md"
    questions = questions_path.read_text(encoding="utf-8")
    question_start = questions.index("- id: q-ch01-04")
    question_end = questions.index("- id: q-ch01-05")
    matching_question = """- id: q-ch01-04
  lesson_id: ch01-l02
  objective_ids:
  - ch01-o03
  kind: matching
  content_version: 0.3.0
  prompt: Ordne die Aussage zu.
  items:
  - id: i1
    text: Die Anforderung wurde weiterentwickelt.
  categories:
  - id: c1
    label: Progression
  correct_mapping:
    i1: c1
  source_ids: []
  misconception: Eine Zuordnung wird nicht geprüft.
"""
    questions_path.write_text(
        questions[:question_start] + matching_question + questions[question_end:],
        encoding="utf-8",
    )

    result = ContentLoader(
        content_root, content_root.parent / "research" / "SOURCES.md"
    ).load()
    assert result.report.status == "failed"
    assert any(
        issue.code == "unsupported_published_question"
        and issue.location == "q-ch01-04"
        for issue in result.report.issues
    )
    assert not any(
        issue.code == "unsupported_published_question"
        and issue.location == "q-ch01-11"
        for issue in result.report.issues
    )
