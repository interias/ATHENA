FROM python:3.13.7-slim-bookworm@sha256:adafcc17694d715c905b4c7bebd96907a1fd5cf183395f0ebc4d3428bd22d92d AS builder

WORKDIR /app
RUN pip install --no-cache-dir uv==0.11.25
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

FROM python:3.13.7-slim-bookworm@sha256:adafcc17694d715c905b4c7bebd96907a1fd5cf183395f0ebc4d3428bd22d92d

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/src" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ATHENA_CONTENT_ROOT=/content \
    ATHENA_SOURCES_PATH=/research/SOURCES.md \
    ATHENA_DATABASE_PATH=/data/athena.db

RUN groupadd --system athena \
    && useradd --system --gid athena --home-dir /app athena \
    && mkdir -p /app /data \
    && chown -R athena:athena /app /data

WORKDIR /app
COPY --from=builder --chown=athena:athena /app/.venv /app/.venv
COPY --chown=athena:athena src ./src
COPY --chown=athena:athena migrations ./migrations

USER athena
CMD ["uvicorn", "athena_api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
