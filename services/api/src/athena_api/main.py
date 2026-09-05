from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime
import json
from typing import AsyncIterator
from uuid import UUID

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

from .config import Settings
from .content import ContentLoader, M0_LESSON_ID, lesson_response
from .database import AttemptConflictError, AttemptRecord, Database
from .models import (
    AttemptRequest,
    AttemptResponse,
    ContentIssue,
    ContentManifest,
    ContentReport,
    CurriculumChapter,
    CurriculumLesson,
    CurriculumResponse,
    LessonResponse,
    ReadinessCheck,
    ReadinessResponse,
    SingleChoiceAnswer,
)

M0_ATTEMPT_QUESTION_ID = "q-ch01-01"
CANONICAL_SINGLE_CHOICE = "canonical_single_choice"


def create_app(settings: Settings | None = None) -> FastAPI:
    configured = settings or Settings.from_env()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        app.state.content_manifest = None
        app.state.content_report = ContentReport(status="failed")
        app.state.database_error = None

        try:
            result = ContentLoader(
                configured.content_root, configured.sources_path
            ).load()
            app.state.content_manifest = result.manifest
            app.state.content_report = result.report
        except Exception as exc:  # keep process health distinct from readiness
            app.state.content_report = ContentReport(
                status="failed",
                issues=[
                    ContentIssue(
                        code="content_loader_error",
                        location=str(configured.content_root),
                        message=f"Contentprüfung fehlgeschlagen: {exc}",
                    )
                ],
            )

        database = Database(configured.database_path, configured.migrations_path)
        app.state.database = database
        try:
            database.migrate()
        except Exception as exc:  # process remains inspectable through health/readiness
            app.state.database_error = str(exc)
        yield

    application = FastAPI(title="ATHENA API", version="0.1.0", lifespan=lifespan)

    @application.get("/healthz")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @application.get(
        "/readyz",
        response_model=ReadinessResponse,
        responses={503: {"model": ReadinessResponse}},
    )
    async def readiness(request: Request) -> ReadinessResponse | JSONResponse:
        response = _readiness(request)
        if response.status == "not_ready":
            return JSONResponse(status_code=503, content=response.model_dump())
        return response

    @application.get(
        "/v1/curriculum",
        response_model=CurriculumResponse,
        responses={503: {"model": ReadinessResponse}},
    )
    async def curriculum(request: Request) -> CurriculumResponse | JSONResponse:
        response = _readiness(request)
        if response.status == "not_ready":
            return JSONResponse(status_code=503, content=response.model_dump())
        manifest: ContentManifest = request.app.state.content_manifest
        return CurriculumResponse(
            content_version=manifest.chapter.content_version,
            chapters=[
                CurriculumChapter(
                    id=manifest.chapter.chapter_id,
                    order=int(manifest.chapter.chapter_id.removeprefix("ch")),
                    title=manifest.chapter.title,
                    content_version=manifest.chapter.content_version,
                    lessons=[
                        CurriculumLesson(
                            id=lesson.lesson_id,
                            order=lesson.order,
                            title=lesson.title,
                            content_version=lesson.content_version,
                            availability=(
                                "available"
                                if lesson.lesson_id == M0_LESSON_ID
                                else "planned"
                            ),
                        )
                        for lesson in manifest.lessons
                    ],
                )
            ]
        )

    @application.get(
        "/v1/lessons/{lesson_id}",
        response_model=LessonResponse,
        responses={
            404: {"description": "Lektion nicht gefunden"},
            503: {"model": ReadinessResponse},
        },
    )
    async def lesson(
        lesson_id: str, request: Request
    ) -> LessonResponse | JSONResponse:
        if lesson_id != M0_LESSON_ID:
            raise HTTPException(status_code=404, detail="Lektion nicht gefunden.")
        response = _readiness(request)
        if response.status == "not_ready":
            return JSONResponse(status_code=503, content=response.model_dump())
        manifest: ContentManifest = request.app.state.content_manifest
        return lesson_response(manifest)

    @application.post(
        "/v1/attempts",
        response_model=AttemptResponse,
        status_code=201,
        responses={
            404: {"description": "Aufgabe nicht gefunden"},
            409: {"description": "Inhaltsversion oder Versuch-ID kollidiert"},
            503: {"model": ReadinessResponse},
        },
    )
    def create_attempt(
        payload: AttemptRequest, request: Request
    ) -> AttemptResponse | JSONResponse:
        if payload.item_id != M0_ATTEMPT_QUESTION_ID:
            raise HTTPException(status_code=404, detail="Aufgabe nicht gefunden.")
        response = _readiness(request)
        if response.status == "not_ready":
            return JSONResponse(status_code=503, content=response.model_dump())

        database: Database = request.app.state.database
        try:
            stored = database.find_attempt(
                attempt_id=str(payload.attempt_id),
                item_id=payload.item_id,
                content_version=payload.content_version,
                answer=payload.answer.model_dump(),
                confidence=payload.confidence,
                mode=payload.mode,
                assisted=payload.assisted,
            )
        except AttemptConflictError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        if stored is not None:
            return _attempt_response(stored)

        manifest: ContentManifest = request.app.state.content_manifest
        question = next(
            item for item in manifest.questions if item.id == M0_ATTEMPT_QUESTION_ID
        )
        if payload.content_version != question.content_version:
            raise HTTPException(
                status_code=409, detail="Inhaltsversion stimmt nicht überein."
            )
        option_ids = {option.id for option in question.options or []}
        if payload.answer.option_id not in option_ids:
            raise HTTPException(status_code=422, detail="Antwortoption ist ungültig.")

        is_correct = payload.answer.option_id == question.correct_option
        feedback_by_option = question.feedback_by_option or {}
        try:
            stored = database.save_attempt(
                attempt_id=str(payload.attempt_id),
                item_id=payload.item_id,
                content_version=payload.content_version,
                answer=payload.answer.model_dump(),
                confidence=payload.confidence,
                mode=payload.mode,
                assisted=payload.assisted,
                objective_result="correct" if is_correct else "incorrect",
                grading_source=CANONICAL_SINGLE_CHOICE,
                feedback=feedback_by_option[payload.answer.option_id],
            )
        except AttemptConflictError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

        return _attempt_response(stored)

    return application


def _attempt_response(stored: AttemptRecord) -> AttemptResponse:
    stored_answer = SingleChoiceAnswer.model_validate(
        json.loads(stored.answer_json)
    )
    return AttemptResponse(
        attempt_id=UUID(stored.id),
        item_id=stored.item_id,
        content_version=stored.content_version,
        answer=stored_answer,
        confidence=stored.confidence,
        mode=stored.mode,
        assisted=stored.assisted,
        created_at=datetime.fromisoformat(stored.created_at),
        objective_result=stored.objective_result,
        grading_source=stored.grading_source,
        feedback=stored.feedback,
    )


def _readiness(request: Request) -> ReadinessResponse:
    content_report: ContentReport = request.app.state.content_report
    content_check = ReadinessCheck(
        status=content_report.status,
        issues=content_report.issues,
    )
    database_issues: list[ContentIssue] = []
    database_error = request.app.state.database_error
    if database_error is None:
        try:
            request.app.state.database.check()
        except Exception as exc:
            database_error = str(exc)
    if database_error is not None:
        database_issues.append(
            ContentIssue(
                code="database_unavailable",
                location=str(request.app.state.database.path),
                message=f"Datenbankprüfung fehlgeschlagen: {database_error}",
            )
        )
    database_check = ReadinessCheck(
        status="failed" if database_issues else "ok", issues=database_issues
    )
    ready = content_check.status == "ok" and database_check.status == "ok"
    return ReadinessResponse(
        status="ready" if ready else "not_ready",
        checks={"content": content_check, "database": database_check},
    )


app = create_app()
