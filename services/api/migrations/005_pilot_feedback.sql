CREATE TABLE pilot_feedback (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    content_version TEXT NOT NULL,
    ratings_json TEXT NOT NULL,
    free_text TEXT NOT NULL,
    created_at TEXT NOT NULL
);

PRAGMA user_version = 5;
