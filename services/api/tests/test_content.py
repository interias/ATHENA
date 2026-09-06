from __future__ import annotations

from pathlib import Path

from athena_api.content import ContentLoader


def issue_codes(content_root: Path) -> set[str]:
    sources_path = content_root.parent / "research" / "SOURCES.md"
    return {
        issue.code
        for issue in ContentLoader(content_root, sources_path).load().report.issues
    }


def test_canonical_complete_structure_is_valid(content_root: Path) -> None:
    result = ContentLoader(
        content_root, content_root.parent / "research" / "SOURCES.md"
    ).load()
    assert result.report.status == "ok"
    assert result.manifest is not None
    assert len(result.manifest.lessons) == 4
    assert len(result.manifest.questions) == 12
    assert len(result.manifest.review_cards) == 8
    assert len(result.manifest.transfer_cases) == 2
    assert len(result.manifest.figures) == 6
    assert len(result.manifest.optional_scenes) == 1
    assert len(result.manifest.interactions) == 2
    assert len(result.manifest.sources) == 33


def test_question_must_use_an_objective_from_its_planned_lesson(
    content_root: Path,
) -> None:
    path = content_root / "ch01" / "05_QUESTIONS.md"
    text = path.read_text(encoding="utf-8")
    start = text.index("- id: q-ch01-04")
    end = text.index("- id: q-ch01-05")
    section = text[start:end].replace("  - ch01-o03", "  - ch01-o01", 1)
    path.write_text(text[:start] + section + text[end:], encoding="utf-8")
    assert "invalid_reference" in issue_codes(content_root)


def test_lesson_must_not_declare_a_question_from_another_lesson(
    content_root: Path,
) -> None:
    path = content_root / "ch01" / "02_ADAPTATION.md"
    path.write_text(
        path.read_text(encoding="utf-8").replace(
            "- q-ch01-06", "- q-ch01-06\n- q-ch01-07", 1
        ),
        encoding="utf-8",
    )
    assert "invalid_assignment" in issue_codes(content_root)


def test_lesson_must_not_declare_a_figure_from_another_lesson(
    content_root: Path,
) -> None:
    path = content_root / "ch01" / "02_ADAPTATION.md"
    path.write_text(
        path.read_text(encoding="utf-8").replace(
            "- fig-ch01-adaptation",
            "- fig-ch01-adaptation\n- fig-ch01-performance",
            1,
        ),
        encoding="utf-8",
    )
    assert "invalid_assignment" in issue_codes(content_root)


def test_interaction_requires_a_back_reference_from_its_figure(
    content_root: Path,
) -> None:
    path = content_root / "ch01" / "06_VISUAL_BRIEFS.md"
    path.write_text(
        path.read_text(encoding="utf-8").replace(
            "  interaction_id: int-ch01-load", "  interaction_id: null", 1
        ),
        encoding="utf-8",
    )
    assert "invalid_assignment" in issue_codes(content_root)


def test_unknown_component_block_is_rejected(content_root: Path) -> None:
    path = content_root / "ch01" / "02_ADAPTATION.md"
    path.write_text(
        path.read_text(encoding="utf-8").replace(
            "[[figure:fig-ch01-adaptation]]", "[[video:fig-ch01-adaptation]]"
        ),
        encoding="utf-8",
    )
    assert "invalid_block" in issue_codes(content_root)


def test_source_ranges_are_rejected(content_root: Path) -> None:
    path = content_root / "ch01" / "03_FATIGUE.md"
    path.write_text(
        path.read_text(encoding="utf-8").replace("[S08]", "[S06–S08]", 1),
        encoding="utf-8",
    )
    assert "invalid_source_marker" in issue_codes(content_root)


def test_short_source_marker_in_planned_lesson_is_rejected(content_root: Path) -> None:
    path = content_root / "ch01" / "03_FATIGUE.md"
    path.write_text(
        path.read_text(encoding="utf-8").replace("[S08]", "[S4]", 1),
        encoding="utf-8",
    )
    assert "invalid_source_marker" in issue_codes(content_root)


def test_raw_html_in_planned_lesson_is_rejected_with_clear_issue(
    content_root: Path,
) -> None:
    path = content_root / "ch01" / "04_OBSERVATION.md"
    path.write_text(
        path.read_text(encoding="utf-8") + '\n<script>alert("test")</script>\n',
        encoding="utf-8",
    )
    result = ContentLoader(
        content_root, content_root.parent / "research" / "SOURCES.md"
    ).load()
    assert any(
        issue.code == "invalid_html" and "Rohes HTML" in issue.message
        for issue in result.report.issues
    )


def test_plain_angle_brackets_are_not_treated_as_raw_html(content_root: Path) -> None:
    path = content_root / "ch01" / "04_OBSERVATION.md"
    path.write_text(
        path.read_text(encoding="utf-8") + "\nEin Wert < 3 kann kleiner als ein Wert > 1 sein.\n",
        encoding="utf-8",
    )
    assert issue_codes(content_root) == set()


def test_duplicate_ids_are_rejected(content_root: Path) -> None:
    path = content_root / "ch01" / "05_QUESTIONS.md"
    text = path.read_text(encoding="utf-8")
    start = text.index("- id: q-ch01-02")
    end = text.index("- id: q-ch01-03")
    section = text[start:end].replace("q-ch01-02", "q-ch01-01", 1)
    path.write_text(text[:start] + section + text[end:], encoding="utf-8")
    assert "duplicate_id" in issue_codes(content_root)


def test_missing_m0_renderer_requirement_is_rejected(content_root: Path) -> None:
    path = content_root / "ch01" / "06_VISUAL_BRIEFS.md"
    path.write_text(
        path.read_text(encoding="utf-8").replace(
            "  required_in: M0", "  required_in: M1", 1
        ),
        encoding="utf-8",
    )
    assert "missing_m0_renderer" in issue_codes(content_root)


def test_unknown_renderer_in_planned_lesson_is_rejected(content_root: Path) -> None:
    path = content_root / "ch01" / "06_VISUAL_BRIEFS.md"
    text = path.read_text(encoding="utf-8")
    start = text.index("- id: fig-ch01-adaptation")
    end = text.index("- id: fig-ch01-performance")
    section = text[start:end].replace("  render_kind: svg", "  render_kind: iframe")
    path.write_text(text[:start] + section + text[end:], encoding="utf-8")
    assert "unknown_renderer" in issue_codes(content_root)


def test_wrong_field_type_in_planned_lesson_is_rejected(content_root: Path) -> None:
    path = content_root / "ch01" / "02_ADAPTATION.md"
    path.write_text(
        path.read_text(encoding="utf-8").replace("order: 2", "order: planned", 1),
        encoding="utf-8",
    )
    assert "schema_error" in issue_codes(content_root)


def test_duplicate_option_ids_are_rejected(content_root: Path) -> None:
    path = content_root / "ch01" / "05_QUESTIONS.md"
    text = path.read_text(encoding="utf-8")
    start = text.index("- id: q-ch01-01")
    end = text.index("- id: q-ch01-02")
    section = text[start:end].replace("  - id: b", "  - id: a", 1)
    path.write_text(text[:start] + section + text[end:], encoding="utf-8")
    assert "invalid_question" in issue_codes(content_root)


def test_duplicate_rubric_ids_are_rejected(content_root: Path) -> None:
    path = content_root / "ch01" / "05_QUESTIONS.md"
    text = path.read_text(encoding="utf-8")
    start = text.index("- id: q-ch01-02")
    end = text.index("- id: q-ch01-03")
    section = text[start:end].replace("  - id: c2", "  - id: c1", 1)
    path.write_text(text[:start] + section + text[end:], encoding="utf-8")
    assert "invalid_question" in issue_codes(content_root)
