-- Photos on daily reports. The image bytes live in the private R2 bucket
-- (binding MEDIA); this table is the index. Access is enforced server-side by
-- the /media/[id] route: staff see everything, a parent only photos of
-- children linked to them via child_parents.

CREATE TABLE IF NOT EXISTS media (
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	child_id     INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
	author_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
	r2_key       TEXT NOT NULL,
	content_type TEXT,
	caption      TEXT,
	created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_media_child ON media (child_id, created_at DESC);
