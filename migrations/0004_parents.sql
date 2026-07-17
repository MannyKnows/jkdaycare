-- Parent portal: link parents to their children, and one-time invite tokens the
-- owner generates to onboard a parent (no email service required — the owner
-- shares the link). A parent is a row in `users` with role = 'parent'.

-- Which children a parent account may see. A join table (not a column on
-- children) so siblings and two-guardian families work from day one.
CREATE TABLE IF NOT EXISTS child_parents (
	child_id   INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
	user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	PRIMARY KEY (child_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_child_parents_user ON child_parents (user_id);

-- One-time invite tokens. We store only a SHA-256 of the token; the raw token
-- lives only in the link the owner copies to the parent. Single-use + expiring.
CREATE TABLE IF NOT EXISTS parent_invites (
	token_hash TEXT PRIMARY KEY,
	child_id   INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
	email      TEXT NOT NULL,
	created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
	expires_at TEXT NOT NULL,
	used_at    TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_parent_invites_child ON parent_invites (child_id);
