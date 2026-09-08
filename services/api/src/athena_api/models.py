from __future__ import annotations

from datetime import datetime
from typing import Annotated, Literal
from urllib.parse import urlsplit
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class ContentIssue(StrictModel):
    code: str
    location: str
    message: str


class ContentReport(StrictModel):
    status: Literal["ok", "failed"]
    issues: list[ContentIssue] = Field(default_factory=list)


class Chapter(StrictModel):
    chapter_id: str
    title: str
    content_version: str
    status: Literal["pilot_draft", "editorial_approved", "retired"]
    objective_ids: list[str]


class Lesson(StrictModel):
    lesson_id: str
    chapter_id: str
    order: int = Field(gt=0)
    title: str
    content_version: str
    status: Literal["pilot_draft", "editorial_approved", "retired"]
    editorial_approved_by: str | None
    expert_reviewed_by: str | None
    llm_eligible: bool
    objectives: list[str]
    prerequisites: list[str]
    source_ids: list[str]
    figure_ids: list[str]
    question_ids: list[str]
    body: str = Field(exclude=True)
    path: str = Field(exclude=True)


class QuestionOption(StrictModel):
    id: str
    text: str


class RubricCriterion(StrictModel):
    id: str
    criterion: str
    required: bool


class MatchingCategory(StrictModel):
    id: str
    label: str


class Question(StrictModel):
    id: str
    lesson_id: str
    objective_ids: list[str]
    kind: Literal["single_choice", "free_text", "matching"]
    prompt: str
    source_ids: list[str]
    misconception: str
    content_version: str
    options: list[QuestionOption] | None = None
    correct_option: str | None = None
    feedback_by_option: dict[str, str] | None = None
    rubric: list[RubricCriterion] | None = None
    model_answer: str | None = None
    feedback: str | None = None
    items: list[QuestionOption] | None = None
    categories: list[MatchingCategory] | None = None
    correct_mapping: dict[str, str] | None = None


class LearningItem(StrictModel):
    id: str
    objective_ids: list[str]
    prompt: str
    source_ids: list[str]
    content_version: str
    rubric: list[RubricCriterion]
    model_answer: str
    kind: Literal["free_text"] | None = None
    boundary: str | None = None


class Figure(StrictModel):
    id: str
    lesson_ids: list[str]
    render_kind: str
    interaction_id: str | None
    status: str
    required_in: str | None
    source_ids: list[str]
    asset_path: str | None
    learning_purpose: str
    alt_text: str
    avoid: list[str]
    expert_review: str | None
    long_description: str | None = None
    composition: str | None = None
    exact_labels: list[str] | None = None
    generation_model: str | None = None
    generated_at: str | None = None
    prompt: str | None = None


class InteractionOption(StrictModel):
    id: str
    text: str
    feedback: str


class InteractionRun(StrictModel):
    id: str
    distance: str
    duration: str
    route: str
    reaction: str


class Interaction(StrictModel):
    id: str
    figure_id: str
    lesson_id: str
    objective_ids: list[str]
    source_ids: list[str]
    milestone: str
    question: str | None = None
    options: list[InteractionOption] = Field(default_factory=list)
    runs: list[InteractionRun] = Field(default_factory=list)
    reveal_action_label: str | None = None
    reset_action_label: str | None = None
    reflection_question: str | None = None
    reflection_text: str | None = None


class Source(StrictModel):
    id: str
    authors_or_issuer: str
    title: str
    publication_year: int | None
    url: str
    doi: str | None
    source_type: str
    checked_on: str
    access_scope: str
    use_and_limits: str
    ingestion_policy: Literal[
        "metadata_and_original_notes_only", "external_reference_only"
    ]
    additional_url: str | None = None
    checked_abstract_url: str | None = None

    @field_validator("url", "additional_url", "checked_abstract_url")
    @classmethod
    def validate_http_url(cls, value: str | None) -> str | None:
        if value is None:
            return None
        parsed = urlsplit(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("URL muss HTTP oder HTTPS verwenden")
        return value


class ContentManifest(StrictModel):
    chapter: Chapter
    lessons: list[Lesson]
    questions: list[Question]
    review_cards: list[LearningItem]
    transfer_cases: list[LearningItem]
    figures: list[Figure]
    optional_scenes: list[Figure]
    interactions: list[Interaction]
    sources: list[Source]


class CurriculumLesson(StrictModel):
    id: str
    order: int
    title: str
    content_version: str
    availability: Literal["available", "planned"]


class CurriculumChapter(StrictModel):
    id: str
    order: int
    title: str
    content_version: str
    lessons: list[CurriculumLesson]


class CurriculumResponse(StrictModel):
    content_version: str
    chapters: list[CurriculumChapter]


class LessonHeadingBlock(StrictModel):
    kind: Literal["heading"]
    level: int = Field(ge=1, le=6)
    text: str


class LessonParagraphBlock(StrictModel):
    kind: Literal["paragraph"]
    text: str


class LessonOrderedListBlock(StrictModel):
    kind: Literal["ordered_list"]
    items: list[str] = Field(min_length=1)


class LessonComponentBlock(StrictModel):
    kind: Literal["figure", "interaction", "exercise"]
    id: str


class LessonDetailsBlock(StrictModel):
    kind: Literal["details"]
    label: Literal["Vertiefung", "Kurzabruf"]
    title: str = Field(min_length=1)
    blocks: list[
        LessonHeadingBlock | LessonParagraphBlock | LessonOrderedListBlock
    ] = Field(min_length=1)


class LessonFigure(StrictModel):
    id: str
    learning_purpose: str
    alt_text: str
    long_description: str
    exact_labels: list[str]
    source_ids: list[str]
    status: str
    expert_review: str | None


class LessonInteraction(StrictModel):
    id: str
    figure_id: str
    question: str
    options: list[InteractionOption]
    runs: list[InteractionRun]
    reveal_action_label: str
    reset_action_label: str
    reflection_question: str
    reflection_text: str
    source_ids: list[str]


class LessonSingleChoiceExercise(StrictModel):
    id: str
    kind: Literal["single_choice"]
    prompt: str
    options: list[QuestionOption]
    objective_ids: list[str]
    source_ids: list[str]
    content_version: str
    development_status: Literal["available", "in_development"]


class LessonFreeTextExercise(StrictModel):
    id: str
    kind: Literal["free_text"]
    prompt: str
    objective_ids: list[str]
    source_ids: list[str]
    content_version: str
    development_status: Literal["available", "in_development"]


class LessonResponse(StrictModel):
    id: str
    order: int = Field(gt=0)
    title: str
    content_version: str
    status: Literal["pilot_draft", "editorial_approved", "retired"]
    expert_reviewed_by: str | None
    blocks: list[
        LessonHeadingBlock
        | LessonParagraphBlock
        | LessonOrderedListBlock
        | LessonComponentBlock
        | LessonDetailsBlock
    ]
    sources: list[Source]
    figures: list[LessonFigure]
    interactions: list[LessonInteraction]
    exercises: list[LessonSingleChoiceExercise | LessonFreeTextExercise]


class ProgressUpdateRequest(StrictModel):
    content_version: str = Field(min_length=1, max_length=32)
    read: bool


class LessonProgress(StrictModel):
    lesson_id: str
    content_version: str
    read: bool
    read_at: datetime | None
    updated_at: datetime | None


class ProgressResponse(StrictModel):
    content_version: str
    available_lessons: int = Field(ge=0)
    planned_lessons: int = Field(ge=0)
    read_lessons: int = Field(ge=0)
    lessons: list[LessonProgress]


PilotRating = Annotated[int, Field(ge=1, le=5)]


class PilotFeedbackRequest(StrictModel):
    feedback_id: Annotated[UUID, Field(strict=False)]
    lesson_id: str = Field(min_length=1, max_length=64)
    content_version: str = Field(min_length=1, max_length=32)
    readability: PilotRating
    text_amount: PilotRating
    visual_usefulness: PilotRating
    practical_relevance: PilotRating
    usability: PilotRating
    reread_location: str = Field(default="", max_length=2_000)
    clarifying_visual: str = Field(default="", max_length=2_000)

    @field_validator("reread_location", "clarifying_visual")
    @classmethod
    def reject_unsupported_control_characters(cls, value: str) -> str:
        if any(ord(character) < 32 and character not in "\n\r\t" for character in value):
            raise ValueError("Freitext enthält nicht unterstützte Steuerzeichen.")
        return value


class PilotFeedbackResponse(PilotFeedbackRequest):
    created_at: datetime


class ReadinessCheck(StrictModel):
    status: Literal["ok", "failed"]
    issues: list[ContentIssue] = Field(default_factory=list)


class ReadinessResponse(StrictModel):
    status: Literal["ready", "not_ready"]
    checks: dict[str, ReadinessCheck]


class SingleChoiceAnswer(StrictModel):
    option_id: str = Field(min_length=1, max_length=64)


class FreeTextAnswer(StrictModel):
    text: str = Field(max_length=4_000)

    @field_validator("text")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Antwort darf nicht leer sein.")
        return value


class AttemptRequest(StrictModel):
    attempt_id: Annotated[UUID, Field(strict=False)]
    item_id: str = Field(min_length=1, max_length=64)
    content_version: str = Field(min_length=1, max_length=32)
    answer: SingleChoiceAnswer | FreeTextAnswer
    confidence: Literal["unsicher", "mittel", "sicher"] | None = None
    mode: Literal["practice"]
    assisted: bool


class AttemptResponse(AttemptRequest):
    created_at: datetime
    objective_result: Literal["correct", "incorrect", "not_assessed"]
    grading_source: Literal["canonical_single_choice", "self_assessment"]
    feedback: str
    model_answer: str | None = None
    rubric: list[RubricCriterion] | None = None


class SelfAssessmentRequest(StrictModel):
    content_version: str = Field(min_length=1, max_length=32)
    checked_criterion_ids: list[str] = Field(max_length=64)
    rating: Literal["again", "hard", "good"]

    @field_validator("checked_criterion_ids")
    @classmethod
    def reject_duplicate_criteria(cls, value: list[str]) -> list[str]:
        if any(not criterion_id or len(criterion_id) > 64 for criterion_id in value):
            raise ValueError("Kriterien-IDs sind ungültig.")
        if len(value) != len(set(value)):
            raise ValueError("Kriterien-IDs dürfen nicht doppelt vorkommen.")
        return value


class SelfAssessmentResponse(SelfAssessmentRequest):
    attempt_id: Annotated[UUID, Field(strict=False)]
    item_id: str
    created_at: datetime
    objective_result: Literal["not_assessed"]
    grading_source: Literal["self_assessment"]
