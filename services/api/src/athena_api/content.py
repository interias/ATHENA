from __future__ import annotations

import re
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable, TypeVar

import yaml
from pydantic import BaseModel, ValidationError

from .models import (
    Chapter,
    ContentIssue,
    ContentManifest,
    ContentReport,
    Figure,
    Interaction,
    InteractionOption,
    InteractionRun,
    LearningItem,
    Lesson,
    LessonComponentBlock,
    LessonFigure,
    LessonFreeTextExercise,
    LessonHeadingBlock,
    LessonInteraction,
    LessonParagraphBlock,
    LessonResponse,
    LessonSingleChoiceExercise,
    Question,
    Source,
)

FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n(.*)\Z", re.DOTALL)
YAML_FENCE_RE = re.compile(r"```yaml\s*\n(.*?)\n```", re.DOTALL)
OBJECTIVE_RE = re.compile(r"^\|\s*(ch\d+-o\d+)\s*\|", re.MULTILINE)
COMPONENT_RE = re.compile(
    r"^\[\[(figure|interaction|exercise):([a-z0-9-]+)\]\]$"
)
SOURCE_LIKE_RE = re.compile(r"\[(S\d+[^\]]*)\]")
SOURCE_MARKER_RE = re.compile(r"^S\d{2,}(?:,\s*S\d{2,})*$")
INTERACTION_SECTION_RE = re.compile(
    r"^## I\d+.*?(?=^## I\d+|^## Abgrenzung|\Z)", re.MULTILINE | re.DOTALL
)

M0_LESSON_ID = "ch01-l01"
M0_QUESTION_IDS = {"q-ch01-01", "q-ch01-02"}
M0_RENDERERS = {
    "fig-ch01-two-runs": "interactive_svg_html",
    "int-ch01-load": "interaction",
}
FIGURE_RENDER_KINDS = {"svg", "svg_html", "interactive_svg_html"}

ModelT = TypeVar("ModelT", bound=BaseModel)


class RawHtmlDetector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.lines: set[int] = set()

    def _record(self) -> None:
        self.lines.add(self.getpos()[0])

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        self._record()

    def handle_startendtag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        self._record()

    def handle_endtag(self, tag: str) -> None:
        self._record()

    def handle_comment(self, data: str) -> None:
        self._record()

    def handle_decl(self, decl: str) -> None:
        self._record()

    def handle_pi(self, data: str) -> None:
        self._record()

    def unknown_decl(self, data: str) -> None:
        self._record()


@dataclass(slots=True)
class ContentLoadResult:
    manifest: ContentManifest | None
    report: ContentReport


class ContentLoader:
    def __init__(self, content_root: Path, sources_path: Path):
        self.content_root = content_root
        self.chapter_dir = content_root / "ch01"
        self.sources_path = sources_path
        self.issues: list[ContentIssue] = []

    def load(self) -> ContentLoadResult:
        self.issues = []
        chapter = self._load_chapter()
        lessons = self._load_lessons()
        question_data = self._load_yaml_manifest(
            self.chapter_dir / "05_QUESTIONS.md", "Aufgabenbank"
        )
        visual_data = self._load_yaml_manifest(
            self.chapter_dir / "06_VISUAL_BRIEFS.md", "Visualbriefings"
        )
        interactions = self._load_interactions()
        sources = self._load_sources()

        questions = self._models(
            Question, question_data.get("questions", []), "05_QUESTIONS.md:questions"
        )
        review_cards = self._models(
            LearningItem,
            question_data.get("review_cards", []),
            "05_QUESTIONS.md:review_cards",
        )
        transfer_cases = self._models(
            LearningItem,
            question_data.get("transfer_cases", []),
            "05_QUESTIONS.md:transfer_cases",
        )
        figures = self._models(
            Figure, visual_data.get("figures", []), "06_VISUAL_BRIEFS.md:figures"
        )
        optional_scenes = self._models(
            Figure,
            visual_data.get("optional_scenes", []),
            "06_VISUAL_BRIEFS.md:optional_scenes",
        )

        if chapter is not None:
            self._validate_container_metadata(chapter, question_data, visual_data)
            self._validate_manifest(
                chapter,
                lessons,
                questions,
                review_cards,
                transfer_cases,
                figures,
                optional_scenes,
                interactions,
                sources,
            )
        self._validate_markdown(lessons, questions, figures, interactions, sources)

        if self.issues or chapter is None:
            return ContentLoadResult(
                manifest=None,
                report=ContentReport(status="failed", issues=self.issues),
            )

        manifest = ContentManifest(
            chapter=chapter,
            lessons=sorted(lessons, key=lambda lesson: lesson.order),
            questions=questions,
            review_cards=review_cards,
            transfer_cases=transfer_cases,
            figures=figures,
            optional_scenes=optional_scenes,
            interactions=interactions,
            sources=sources,
        )
        return ContentLoadResult(
            manifest=manifest, report=ContentReport(status="ok")
        )

    def _read(self, path: Path) -> str | None:
        try:
            return path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            self._issue("file_unreadable", str(path), f"Datei nicht lesbar: {exc}")
            return None

    def _frontmatter(self, path: Path) -> tuple[dict[str, Any], str] | None:
        text = self._read(path)
        if text is None:
            return None
        match = FRONTMATTER_RE.match(text)
        if match is None:
            self._issue(
                "invalid_frontmatter", str(path), "YAML-Frontmatter fehlt oder ist ungültig."
            )
            return None
        try:
            metadata = yaml.safe_load(match.group(1))
        except yaml.YAMLError as exc:
            self._issue("invalid_yaml", str(path), f"Ungültiges YAML: {exc}")
            return None
        if not isinstance(metadata, dict):
            self._issue("invalid_yaml", str(path), "Frontmatter muss ein Objekt sein.")
            return None
        return metadata, match.group(2)

    def _load_chapter(self) -> Chapter | None:
        path = self.chapter_dir / "00_CHAPTER.md"
        parsed = self._frontmatter(path)
        if parsed is None:
            return None
        metadata, body = parsed
        metadata["objective_ids"] = OBJECTIVE_RE.findall(body)
        return self._model(Chapter, metadata, str(path))

    def _load_lessons(self) -> list[Lesson]:
        lessons: list[Lesson] = []
        if not self.chapter_dir.is_dir():
            self._issue(
                "missing_content", str(self.chapter_dir), "Kapitelverzeichnis fehlt."
            )
            return lessons
        for path in sorted(self.chapter_dir.glob("[0-9][0-9]_*.md")):
            if path.name in {"00_CHAPTER.md", "05_QUESTIONS.md", "06_VISUAL_BRIEFS.md", "07_INTERACTIONS.md", "08_GLOSSARY.md"}:
                continue
            parsed = self._frontmatter(path)
            if parsed is None:
                continue
            metadata, body = parsed
            metadata.update(body=body, path=str(path))
            lesson = self._model(Lesson, metadata, str(path))
            if lesson is not None:
                lessons.append(lesson)
        if not lessons:
            self._issue("missing_lessons", str(self.chapter_dir), "Keine Lektionen gefunden.")
        return lessons

    def _load_yaml_manifest(self, path: Path, label: str) -> dict[str, Any]:
        text = self._read(path)
        if text is None:
            return {}
        matches = YAML_FENCE_RE.findall(text)
        if len(matches) != 1:
            self._issue(
                "invalid_yaml_manifest",
                str(path),
                f"{label} muss genau einen YAML-Block enthalten.",
            )
            return {}
        try:
            data = yaml.safe_load(matches[0])
        except yaml.YAMLError as exc:
            self._issue("invalid_yaml", str(path), f"Ungültiges YAML: {exc}")
            return {}
        if not isinstance(data, dict):
            self._issue("invalid_yaml", str(path), f"{label} muss ein Objekt sein.")
            return {}
        return data

    def _load_sources(self) -> list[Source]:
        text = self._read(self.sources_path)
        if text is None:
            return []
        sources: list[Source] = []
        for index, yaml_text in enumerate(YAML_FENCE_RE.findall(text), start=1):
            try:
                data = yaml.safe_load(yaml_text)
            except yaml.YAMLError as exc:
                self._issue(
                    "invalid_yaml", f"{self.sources_path}:block-{index}", str(exc)
                )
                continue
            source = self._model(Source, data, f"{self.sources_path}:block-{index}")
            if source is not None:
                sources.append(source)
        if not sources:
            self._issue("missing_sources", str(self.sources_path), "Quellenregister ist leer.")
        return sources

    def _load_interactions(self) -> list[Interaction]:
        path = self.chapter_dir / "07_INTERACTIONS.md"
        text = self._read(path)
        if text is None:
            return []
        interactions: list[Interaction] = []
        for section in INTERACTION_SECTION_RE.findall(text):
            values = {
                "id": self._capture(section, r"- Stabile ID: `([^`]+)`"),
                "figure_id": self._capture(
                    section, r"- Zugehörige Visualisierung: `([^`]+)`"
                ),
                "lesson_id": self._capture(section, r"- Lektion: `([^`]+)`"),
                "milestone": self._capture(section, r"- Umfang: (M\d+)"),
            }
            objectives = self._capture(
                section, r"- Lektion: `[^`]+`; Lernziele: (.+)"
            )
            sources = self._capture(section, r"- Quellen: `\[([^\]]+)\]`")
            values["objective_ids"] = re.findall(r"`([^`]+)`", objectives or "")
            values["source_ids"] = self._split_source_marker(sources or "")
            location = f"{path}:{values.get('id') or 'unbekannt'}"
            if any(value is None for key, value in values.items() if key not in {"objective_ids", "source_ids"}):
                self._issue(
                    "invalid_interaction", location, "Interaktionsmetadaten sind unvollständig."
                )
                continue
            if values["id"] == "int-ch01-load":
                details = self._parse_m0_interaction(section, location)
                if details is None:
                    continue
                values.update(details)
            interaction = self._model(Interaction, values, location)
            if interaction is not None:
                interactions.append(interaction)
        if not interactions:
            self._issue("missing_interactions", str(path), "Keine Interaktionen gefunden.")
        return interactions

    def _parse_m0_interaction(
        self, section: str, location: str
    ) -> dict[str, Any] | None:
        question = self._capture(section, r"Frage: \*\*„([^“]+)“\*\*")
        option_matches = re.findall(
            r'^([1-3])\. „([^“]+)“ — (?:passend|nicht ableitbar)\.$',
            section,
            re.MULTILINE,
        )
        feedback_matches = re.findall(
            r'Rückmeldung für Auswahl ([1-3]): „([^“]+)“', section
        )
        run_details = re.search(
            r"jeweils ([^,]+?) und ([^,]+?), ([^.]+)\.", section
        )
        reaction_matches = re.findall(r'Lauf ([AB]): „([^“]+)“', section)
        reveal_action_label = self._capture(
            section, r'Nach Auswahl wird „([^“]+)“ aktiv\.'
        )
        reset_action_label = self._capture(
            section, r'„([^“]+)“ setzt Auswahl und aufgedeckte Texte zurück'
        )
        reflection_question = self._capture(
            section, r'Denkfrage: „([^“]+)“'
        )
        reflection_parts = re.search(
            r"erscheinen Beispiele wie ([^.]+)\. \*\*([^*]+)\*\*", section
        )

        option_numbers = [number for number, _ in option_matches]
        feedback_by_number = dict(feedback_matches)
        reaction_by_run = dict(reaction_matches)
        complete = (
            question is not None
            and option_numbers == ["1", "2", "3"]
            and set(feedback_by_number) == {"1", "2", "3"}
            and run_details is not None
            and set(reaction_by_run) == {"A", "B"}
            and reveal_action_label is not None
            and reset_action_label is not None
            and reflection_question is not None
            and reflection_parts is not None
        )
        if not complete:
            self._issue(
                "invalid_interaction",
                location,
                "Die M0-Interaktion ist unvollständig oder hat ein unerwartetes Format.",
            )
            return None

        distance, duration, route = (part.strip() for part in run_details.groups())
        options = [
            InteractionOption(
                id=chr(ord("a") + int(number) - 1),
                text=text,
                feedback=feedback_by_number[number],
            )
            for number, text in option_matches
        ]
        runs = [
            InteractionRun(
                id=run.lower(),
                distance=distance,
                duration=duration,
                route=route,
                reaction=reaction_by_run[run],
            )
            for run in ("A", "B")
        ]
        reflection_example, reflection_limit = reflection_parts.groups()
        reflection_text = (
            f"{reflection_example[0].upper()}{reflection_example[1:]}. "
            f"{reflection_limit}"
        )
        return {
            "question": question,
            "options": options,
            "runs": runs,
            "reveal_action_label": reveal_action_label,
            "reset_action_label": reset_action_label,
            "reflection_question": reflection_question,
            "reflection_text": reflection_text,
        }

    @staticmethod
    def _capture(text: str, pattern: str) -> str | None:
        match = re.search(pattern, text)
        return match.group(1).strip() if match else None

    @staticmethod
    def _split_source_marker(marker: str) -> list[str]:
        return [part.strip() for part in marker.split(",") if part.strip()]

    def _models(
        self, model: type[ModelT], values: Any, location: str
    ) -> list[ModelT]:
        if not isinstance(values, list):
            self._issue("invalid_structure", location, "Wert muss eine Liste sein.")
            return []
        result: list[ModelT] = []
        for index, value in enumerate(values):
            item = self._model(model, value, f"{location}[{index}]")
            if item is not None:
                result.append(item)
        return result

    def _model(
        self, model: type[ModelT], value: Any, location: str
    ) -> ModelT | None:
        try:
            return model.model_validate(value)
        except ValidationError as exc:
            for error in exc.errors(include_url=False):
                field = ".".join(str(part) for part in error["loc"])
                self._issue(
                    "schema_error",
                    f"{location}:{field}",
                    error["msg"],
                )
            return None

    def _validate_manifest(
        self,
        chapter: Chapter,
        lessons: list[Lesson],
        questions: list[Question],
        review_cards: list[LearningItem],
        transfer_cases: list[LearningItem],
        figures: list[Figure],
        optional_scenes: list[Figure],
        interactions: list[Interaction],
        sources: list[Source],
    ) -> None:
        groups: list[tuple[str, Iterable[str]]] = [
            ("chapter", [chapter.chapter_id]),
            ("objective", chapter.objective_ids),
            ("lesson", (item.lesson_id for item in lessons)),
            ("question", (item.id for item in questions)),
            ("review_card", (item.id for item in review_cards)),
            ("transfer_case", (item.id for item in transfer_cases)),
            ("figure", (item.id for item in figures)),
            ("optional_scene", (item.id for item in optional_scenes)),
            ("interaction", (item.id for item in interactions)),
            ("source", (item.id for item in sources)),
        ]
        seen: dict[str, str] = {}
        for kind, identifiers in groups:
            for identifier in identifiers:
                if identifier in seen:
                    self._issue(
                        "duplicate_id",
                        identifier,
                        f"ID wird mehrfach verwendet ({seen[identifier]}, {kind}).",
                    )
                else:
                    seen[identifier] = kind

        lesson_by_id = {lesson.lesson_id: lesson for lesson in lessons}
        question_by_id = {question.id: question for question in questions}
        figure_by_id = {figure.id: figure for figure in figures}
        interaction_by_id = {item.id: item for item in interactions}
        objective_ids = set(chapter.objective_ids)
        source_ids = {source.id for source in sources}

        self._validate_chapter_links(chapter, lessons)

        orders: set[int] = set()
        for lesson in lessons:
            if lesson.chapter_id != chapter.chapter_id:
                self._issue("invalid_reference", lesson.lesson_id, "Kapitelreferenz ist ungültig.")
            if lesson.content_version != chapter.content_version:
                self._issue("version_mismatch", lesson.lesson_id, "Lektions- und Kapitelversion stimmen nicht überein.")
            if lesson.order in orders:
                self._issue("duplicate_order", lesson.lesson_id, f"Lektionsreihenfolge {lesson.order} ist doppelt.")
            orders.add(lesson.order)
            self._references(lesson.lesson_id, "Lernziel", lesson.objectives, objective_ids)
            self._references(lesson.lesson_id, "Voraussetzung", lesson.prerequisites, set(lesson_by_id))
            self._references(lesson.lesson_id, "Quelle", lesson.source_ids, source_ids)
            self._references(lesson.lesson_id, "Grafik", lesson.figure_ids, set(figure_by_id))
            self._references(lesson.lesson_id, "Aufgabe", lesson.question_ids, set(question_by_id))
            for figure_id in lesson.figure_ids:
                figure = figure_by_id.get(figure_id)
                if figure is not None and lesson.lesson_id not in figure.lesson_ids:
                    self._issue(
                        "invalid_assignment",
                        lesson.lesson_id,
                        f"Grafik {figure_id} verweist nicht auf diese Lektion zurück.",
                    )
            for question_id in lesson.question_ids:
                question = question_by_id.get(question_id)
                if question is not None and question.lesson_id != lesson.lesson_id:
                    self._issue(
                        "invalid_assignment",
                        lesson.lesson_id,
                        f"Aufgabe {question_id} ist einer anderen Lektion zugeordnet.",
                    )

        for question in questions:
            lesson = lesson_by_id.get(question.lesson_id)
            if lesson is None:
                self._issue("invalid_reference", question.id, f"Unbekannte Lektion {question.lesson_id}.")
            else:
                self._references(question.id, "Lernziel der Lektion", question.objective_ids, set(lesson.objectives))
                if question.id not in lesson.question_ids:
                    self._issue("invalid_assignment", question.id, "Aufgabe fehlt in question_ids ihrer Lektion.")
                if question.content_version != lesson.content_version:
                    self._issue("version_mismatch", question.id, "Aufgaben- und Lektionsversion stimmen nicht überein.")
            if not question.objective_ids:
                self._issue("missing_objective", question.id, "Aufgabe benötigt mindestens ein Lernziel.")
            self._references(question.id, "Quelle", question.source_ids, source_ids)
            self._validate_question(question)

        for item in [*review_cards, *transfer_cases]:
            if not item.objective_ids:
                self._issue("missing_objective", item.id, "Lernobjekt benötigt mindestens ein Lernziel.")
            self._references(item.id, "Lernziel", item.objective_ids, objective_ids)
            self._references(item.id, "Quelle", item.source_ids, source_ids)
            if item.content_version != chapter.content_version:
                self._issue(
                    "version_mismatch",
                    item.id,
                    "Lernobjekt- und Kapitelversion stimmen nicht überein.",
                )
            rubric_ids = [criterion.id for criterion in item.rubric]
            if item in review_cards and not rubric_ids:
                self._issue("missing_rubric", item.id, "Reviewkarte benötigt eine Rubrik.")
            if len(rubric_ids) != len(set(rubric_ids)):
                self._issue(
                    "duplicate_id",
                    item.id,
                    "Rubrik-IDs müssen innerhalb des Lernobjekts eindeutig sein.",
                )

        for figure in [*figures, *optional_scenes]:
            self._references(figure.id, "Lektion", figure.lesson_ids, set(lesson_by_id))
            self._references(figure.id, "Quelle", figure.source_ids, source_ids)
            if figure.interaction_id is not None:
                self._references(figure.id, "Interaktion", [figure.interaction_id], set(interaction_by_id))
                interaction = interaction_by_id.get(figure.interaction_id)
                if interaction and interaction.figure_id != figure.id:
                    self._issue("invalid_assignment", figure.id, "Interaktion verweist nicht auf diese Grafik zurück.")
            if figure in figures and (
                not figure.learning_purpose
                or not figure.alt_text
                or not figure.long_description
            ):
                self._issue("missing_description", figure.id, "Grafik benötigt Zweck, Alttext und Langbeschreibung.")
            if figure in figures:
                if figure.render_kind not in FIGURE_RENDER_KINDS:
                    self._issue("unknown_renderer", figure.id, f"Unbekannter Renderer {figure.render_kind}.")
                for lesson_id in figure.lesson_ids:
                    lesson = lesson_by_id.get(lesson_id)
                    if lesson is not None and figure.id not in lesson.figure_ids:
                        self._issue("invalid_assignment", figure.id, f"Grafik fehlt in figure_ids von {lesson_id}.")
            elif figure.render_kind != "generated_scene":
                self._issue("unknown_renderer", figure.id, f"Unbekannter Szenen-Renderer {figure.render_kind}.")

            if figure.asset_path is not None:
                asset_path = (self.content_root.parent / figure.asset_path).resolve()
                if (
                    not asset_path.is_relative_to(self.content_root.parent.resolve())
                    or not asset_path.is_file()
                ):
                    self._issue("missing_asset", figure.id, f"Asset {figure.asset_path} ist nicht sicher auflösbar.")

        for interaction in interactions:
            self._references(interaction.id, "Grafik", [interaction.figure_id], set(figure_by_id))
            self._references(interaction.id, "Lektion", [interaction.lesson_id], set(lesson_by_id))
            self._references(interaction.id, "Lernziel", interaction.objective_ids, objective_ids)
            self._references(interaction.id, "Quelle", interaction.source_ids, source_ids)
            lesson = lesson_by_id.get(interaction.lesson_id)
            figure = figure_by_id.get(interaction.figure_id)
            if figure is not None and figure.interaction_id != interaction.id:
                self._issue(
                    "invalid_assignment",
                    interaction.id,
                    "Grafik verweist nicht auf diese Interaktion zurück.",
                )
            if lesson is not None:
                self._references(interaction.id, "Lernziel der Lektion", interaction.objective_ids, set(lesson.objectives))
                if interaction.figure_id not in lesson.figure_ids:
                    self._issue("invalid_assignment", interaction.id, "Interaktionsgrafik fehlt in figure_ids der Lektion.")

        for source in sources:
            if not source.url.startswith(("https://", "http://")):
                self._issue("invalid_source_url", source.id, "Quellen-URL muss HTTP oder HTTPS verwenden.")

        self._validate_m0(lesson_by_id, question_by_id, figure_by_id, interaction_by_id)

    def _validate_question(self, question: Question) -> None:
        if question.kind == "single_choice":
            options = question.options or []
            option_ids = [option.id for option in options]
            feedback = question.feedback_by_option or {}
            if (
                not options
                or len(option_ids) != len(set(option_ids))
                or question.correct_option not in option_ids
                or set(feedback) != set(option_ids)
            ):
                self._issue("invalid_question", question.id, "Single-Choice-Optionen, Lösung und Feedback passen nicht zusammen.")
        elif question.kind == "free_text":
            rubric_ids = [criterion.id for criterion in question.rubric or []]
            if (
                not rubric_ids
                or len(rubric_ids) != len(set(rubric_ids))
                or not question.model_answer
                or not question.feedback
            ):
                self._issue("invalid_question", question.id, "Freitextaufgabe benötigt Rubrik, Musterlösung und Feedback.")
        elif question.kind == "matching":
            item_ids = [item.id for item in question.items or []]
            category_ids = [item.id for item in question.categories or []]
            mapping = question.correct_mapping or {}
            if (
                not item_ids
                or not category_ids
                or len(item_ids) != len(set(item_ids))
                or len(category_ids) != len(set(category_ids))
                or set(mapping) != set(item_ids)
                or not set(mapping.values()).issubset(set(category_ids))
            ):
                self._issue("invalid_question", question.id, "Matching-Zuordnung ist unvollständig oder ungültig.")

    def _validate_m0(
        self,
        lessons: dict[str, Lesson],
        questions: dict[str, Question],
        figures: dict[str, Figure],
        interactions: dict[str, Interaction],
    ) -> None:
        lesson = lessons.get(M0_LESSON_ID)
        if lesson is None:
            self._issue("missing_m0_content", M0_LESSON_ID, "M0-Pilotlektion fehlt.")
            return
        for question_id in M0_QUESTION_IDS:
            question = questions.get(question_id)
            if question is None or question.lesson_id != M0_LESSON_ID:
                self._issue("missing_m0_content", question_id, "M0-Aufgabe fehlt oder ist falsch zugeordnet.")
        for renderer_id, render_kind in M0_RENDERERS.items():
            if render_kind == "interaction":
                item = interactions.get(renderer_id)
                valid = item is not None and item.milestone == "M0"
            else:
                item = figures.get(renderer_id)
                valid = item is not None and item.required_in == "M0" and item.render_kind == render_kind
            if not valid:
                self._issue("missing_m0_renderer", renderer_id, "M0-Renderer-Anforderung ist nicht erfüllt.")

        unexpected_figures = {
            figure.id for figure in figures.values() if figure.required_in == "M0"
        } - {"fig-ch01-two-runs"}
        unexpected_interactions = {
            item.id for item in interactions.values() if item.milestone == "M0"
        } - {"int-ch01-load"}
        for renderer_id in sorted(unexpected_figures | unexpected_interactions):
            self._issue("unsupported_m0_renderer", renderer_id, "Kein M0-Renderer registriert.")

    def _validate_container_metadata(
        self,
        chapter: Chapter,
        question_data: dict[str, Any],
        visual_data: dict[str, Any],
    ) -> None:
        for location, data in (
            ("05_QUESTIONS.md", question_data),
            ("06_VISUAL_BRIEFS.md", visual_data),
        ):
            if data.get("schema_version") != "1.0":
                self._issue("unsupported_schema", location, "schema_version muss 1.0 sein.")
            if data.get("chapter_id") != chapter.chapter_id:
                self._issue("invalid_reference", location, "chapter_id passt nicht zum Kapitel.")
        if question_data.get("content_version") != chapter.content_version:
            self._issue("version_mismatch", "05_QUESTIONS.md", "Aufgabenbank- und Kapitelversion stimmen nicht überein.")

    def _validate_chapter_links(self, chapter: Chapter, lessons: list[Lesson]) -> None:
        path = self.chapter_dir / "00_CHAPTER.md"
        text = self._read(path) or ""
        links = {
            target: (int(order), title)
            for order, title, target in re.findall(
                r"\[L(\d+) — ([^\]]+)\]\(([^)]+\.md)\)", text
            )
        }
        for lesson in lessons:
            target = Path(lesson.path).name
            linked = links.get(target)
            if linked != (lesson.order, lesson.title):
                self._issue(
                    "invalid_chapter_index",
                    chapter.chapter_id,
                    f"Kapitelverweis für {lesson.lesson_id} fehlt oder weicht von Reihenfolge/Titel ab.",
                )
        lesson_targets = {Path(lesson.path).name for lesson in lessons}
        for target in set(links) - lesson_targets:
            self._issue("invalid_reference", chapter.chapter_id, f"Kapitel verlinkt unbekannte Lektion {target}.")

    def _validate_markdown(
        self,
        lessons: list[Lesson],
        questions: list[Question],
        figures: list[Figure],
        interactions: list[Interaction],
        sources: list[Source],
    ) -> None:
        source_ids = {source.id for source in sources}
        question_by_id = {question.id: question for question in questions}
        figure_by_id = {figure.id: figure for figure in figures}
        interaction_by_id = {item.id: item for item in interactions}

        for lesson in lessons:
            declared_sources = set(lesson.source_ids)
            raw_html = RawHtmlDetector()
            raw_html.feed(lesson.body)
            lesson_text = self._read(Path(lesson.path)) or ""
            frontmatter = FRONTMATTER_RE.match(lesson_text)
            body_line_offset = (
                lesson_text[: frontmatter.start(2)].count("\n")
                if frontmatter is not None
                else 0
            )
            for line_number in sorted(raw_html.lines):
                self._issue(
                    "invalid_html",
                    f"{lesson.path}:{line_number + body_line_offset}",
                    "Rohes HTML ist im Lektions-Markdown nicht zulässig.",
                )
            for line_number, line in enumerate(lesson.body.splitlines(), start=1):
                if "[[" in line:
                    match = COMPONENT_RE.fullmatch(line.strip())
                    if match is None:
                        self._issue("invalid_block", f"{lesson.path}:{line_number}", "Unbekannter oder nicht alleinstehender Komponentenblock.")
                    else:
                        block_type, identifier = match.groups()
                        known = {
                            "figure": figure_by_id,
                            "interaction": interaction_by_id,
                            "exercise": question_by_id,
                        }[block_type]
                        if identifier not in known:
                            self._issue("invalid_reference", f"{lesson.path}:{line_number}", f"Unbekannte Komponenten-ID {identifier}.")
                        elif block_type == "figure" and identifier not in lesson.figure_ids:
                            self._issue("invalid_assignment", f"{lesson.path}:{line_number}", f"Grafik {identifier} gehört nicht zu dieser Lektion.")
                        elif block_type == "exercise" and identifier not in lesson.question_ids:
                            self._issue("invalid_assignment", f"{lesson.path}:{line_number}", f"Aufgabe {identifier} gehört nicht zu dieser Lektion.")
                        elif block_type == "interaction" and known[identifier].lesson_id != lesson.lesson_id:
                            self._issue("invalid_assignment", f"{lesson.path}:{line_number}", f"Interaktion {identifier} gehört nicht zu dieser Lektion.")
                for marker in SOURCE_LIKE_RE.findall(line):
                    if not SOURCE_MARKER_RE.fullmatch(marker):
                        self._issue("invalid_source_marker", f"{lesson.path}:{line_number}", f"Unzulässiger Quellenmarker [{marker}].")
                        continue
                    for source_id in self._split_source_marker(marker):
                        if source_id not in source_ids:
                            self._issue("invalid_reference", f"{lesson.path}:{line_number}", f"Unbekannte Quelle {source_id}.")
                        if source_id not in declared_sources:
                            self._issue("undeclared_source", f"{lesson.path}:{line_number}", f"Quelle {source_id} fehlt in source_ids der Lektion.")

        for path in sorted(self.chapter_dir.glob("*.md")):
            text = self._read(path)
            if text is None:
                continue
            for line_number, line in enumerate(text.splitlines(), start=1):
                for marker in SOURCE_LIKE_RE.findall(line):
                    if not SOURCE_MARKER_RE.fullmatch(marker):
                        self._issue("invalid_source_marker", f"{path}:{line_number}", f"Unzulässiger Quellenmarker [{marker}].")
                    else:
                        for source_id in self._split_source_marker(marker):
                            if source_id not in source_ids:
                                self._issue("invalid_reference", f"{path}:{line_number}", f"Unbekannte Quelle {source_id}.")

    def _references(
        self, owner: str, label: str, references: Iterable[str], known: set[str]
    ) -> None:
        for reference in references:
            if reference not in known:
                self._issue("invalid_reference", owner, f"{label} {reference} ist nicht auflösbar.")

    def _issue(self, code: str, location: str, message: str) -> None:
        issue = ContentIssue(code=code, location=location, message=message)
        if issue not in self.issues:
            self.issues.append(issue)


def lesson_response(manifest: ContentManifest) -> LessonResponse:
    lesson = next(item for item in manifest.lessons if item.lesson_id == M0_LESSON_ID)
    figure_by_id = {item.id: item for item in manifest.figures}
    interaction_by_id = {item.id: item for item in manifest.interactions}
    question_by_id = {item.id: item for item in manifest.questions}
    source_by_id = {item.id: item for item in manifest.sources}

    figures = []
    for figure_id in lesson.figure_ids:
        figure = figure_by_id[figure_id]
        figures.append(
            LessonFigure(
                id=figure.id,
                learning_purpose=figure.learning_purpose,
                alt_text=figure.alt_text,
                long_description=figure.long_description or "",
                exact_labels=figure.exact_labels or [],
                source_ids=figure.source_ids,
                status=figure.status,
                expert_review=figure.expert_review,
            )
        )

    interaction = interaction_by_id["int-ch01-load"]
    public_interaction = LessonInteraction(
        id=interaction.id,
        figure_id=interaction.figure_id,
        question=interaction.question or "",
        options=interaction.options,
        runs=interaction.runs,
        reveal_action_label=interaction.reveal_action_label or "",
        reset_action_label=interaction.reset_action_label or "",
        reflection_question=interaction.reflection_question or "",
        reflection_text=interaction.reflection_text or "",
        source_ids=interaction.source_ids,
    )

    exercises: list[LessonSingleChoiceExercise | LessonFreeTextExercise] = []
    for question_id in lesson.question_ids:
        if question_id not in M0_QUESTION_IDS:
            continue
        question = question_by_id[question_id]
        common = {
            "id": question.id,
            "prompt": question.prompt,
            "objective_ids": question.objective_ids,
            "source_ids": question.source_ids,
            "content_version": question.content_version,
            "development_status": (
                "available" if question.id in M0_QUESTION_IDS else "in_development"
            ),
        }
        if question.kind == "single_choice":
            exercises.append(
                LessonSingleChoiceExercise(
                    kind="single_choice", options=question.options or [], **common
                )
            )
        elif question.kind == "free_text":
            exercises.append(LessonFreeTextExercise(kind="free_text", **common))

    return LessonResponse(
        id=lesson.lesson_id,
        title=lesson.title,
        content_version=lesson.content_version,
        status=lesson.status,
        expert_reviewed_by=lesson.expert_reviewed_by,
        blocks=_lesson_blocks(lesson.body),
        sources=[source_by_id[source_id] for source_id in lesson.source_ids],
        figures=figures,
        interactions=[public_interaction],
        exercises=exercises,
    )


def _lesson_blocks(
    body: str,
) -> list[LessonHeadingBlock | LessonParagraphBlock | LessonComponentBlock]:
    blocks: list[LessonHeadingBlock | LessonParagraphBlock | LessonComponentBlock] = []
    paragraph_lines: list[str] = []

    def flush_paragraph() -> None:
        if paragraph_lines:
            blocks.append(
                LessonParagraphBlock(kind="paragraph", text="\n".join(paragraph_lines))
            )
            paragraph_lines.clear()

    for line in body.strip().splitlines():
        if not line.strip():
            flush_paragraph()
            continue
        heading = re.fullmatch(r"(#{1,6})\s+(.+)", line)
        component = COMPONENT_RE.fullmatch(line)
        if heading is not None:
            flush_paragraph()
            hashes, text = heading.groups()
            blocks.append(
                LessonHeadingBlock(kind="heading", level=len(hashes), text=text)
            )
        elif component is not None:
            flush_paragraph()
            kind, identifier = component.groups()
            blocks.append(LessonComponentBlock(kind=kind, id=identifier))
        else:
            paragraph_lines.append(line)
    flush_paragraph()
    return blocks
