-- Stores submissions from the "Want more information?" signup form on the
-- coming-soon homepage. Email is unique so re-submissions update the existing
-- row instead of creating duplicates.
CREATE TABLE IF NOT EXISTS signups (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	name       TEXT NOT NULL,
	email      TEXT NOT NULL UNIQUE,
	phone      TEXT NOT NULL,
	address    TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_signups_created_at ON signups (created_at);
