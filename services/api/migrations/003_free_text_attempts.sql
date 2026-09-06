ALTER TABLE attempts RENAME TO attempts_v2;

CREATE TABLE attempts (
    id TEXT PRIMARY KEY NOT NULL,
    item_id TEXT NOT NULL,
    content_version TEXT NOT NULL,
    answer_json TEXT NOT NULL,
    confidence TEXT CHECK (confidence IN ('unsicher', 'mittel', 'sicher')),
    mode TEXT NOT NULL CHECK (mode = 'practice'),
    assisted INTEGER NOT NULL CHECK (assisted IN (0, 1)),
    created_at TEXT NOT NULL,
    objective_result TEXT NOT NULL CHECK (objective_result IN ('correct', 'incorrect', 'not_assessed')),
    grading_source TEXT NOT NULL CHECK (grading_source IN ('canonical_single_choice', 'self_assessment')),
    feedback TEXT NOT NULL,
    solution_json TEXT,
    CHECK (
        (grading_source = 'canonical_single_choice' AND objective_result IN ('correct', 'incorrect') AND solution_json IS NULL)
        OR
        (grading_source = 'self_assessment' AND objective_result = 'not_assessed' AND solution_json IS NOT NULL)
    )
);

INSERT INTO attempts (
    id, item_id, content_version, answer_json, confidence, mode, assisted,
    created_at, objective_result, grading_source, feedback, solution_json
)
SELECT
    id, item_id, content_version, answer_json, confidence, mode, assisted,
    created_at, objective_result, grading_source, feedback, NULL
FROM attempts_v2;

DROP TABLE attempts_v2;

CREATE TABLE self_assessments (
    attempt_id TEXT PRIMARY KEY NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    content_version TEXT NOT NULL,
    checked_criterion_ids_json TEXT NOT NULL,
    rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good')),
    created_at TEXT NOT NULL
);

PRAGMA user_version = 3;
