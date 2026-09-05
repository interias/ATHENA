CREATE TABLE attempts (
    id TEXT PRIMARY KEY NOT NULL,
    item_id TEXT NOT NULL,
    content_version TEXT NOT NULL,
    answer_json TEXT NOT NULL,
    confidence TEXT CHECK (confidence IN ('unsicher', 'mittel', 'sicher')),
    mode TEXT NOT NULL CHECK (mode = 'practice'),
    assisted INTEGER NOT NULL CHECK (assisted IN (0, 1)),
    created_at TEXT NOT NULL,
    objective_result TEXT NOT NULL CHECK (objective_result IN ('correct', 'incorrect')),
    grading_source TEXT NOT NULL CHECK (grading_source = 'canonical_single_choice'),
    feedback TEXT NOT NULL
);

PRAGMA user_version = 2;
