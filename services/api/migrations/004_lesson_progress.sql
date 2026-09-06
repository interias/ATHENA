CREATE TABLE lesson_progress (
    lesson_id TEXT NOT NULL,
    content_version TEXT NOT NULL,
    read_at TEXT,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (lesson_id, content_version)
);

PRAGMA user_version = 4;
