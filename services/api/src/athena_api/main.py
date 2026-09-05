from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .config import Settings
from .content import ContentLoader, M0_LESSON_ID
from .database import Database
from .models import (
    ContentIssue,
    ContentManifest,
    ContentReport,
    CurriculumChapter,
    CurriculumLesson,
    CurriculumResponse,
    ReadinessCheck,
    ReadinessResponse,
)


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

    return application


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
