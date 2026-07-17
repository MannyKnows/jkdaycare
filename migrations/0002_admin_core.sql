-- Admin v1 core: accounts + sessions, the children roster, and per-child notes.
-- This is the foundation the rest of the admin (photos, messaging, attendance,
-- billing) will build on. Parents get accounts here too (role = 'parent'),
-- though the parent-facing portal is a later slice.

CREATE TABLE IF NOT EXISTS users (
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	email         TEXT NOT NULL UNIQUE,
	role          TEXT NOT NULL DEFAULT 'parent',   -- 'owner' | 'staff' | 'parent'
	password_hash TEXT,                              -- PBKDF2 (null until set / for magic-link users)
	name          TEXT,
	language      TEXT NOT NULL DEFAULT 'en',        -- 'en' | 'es'
	created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Server-side sessions. We store only a SHA-256 of the cookie token, so a DB
-- leak never exposes live sessions. The raw token lives only in the cookie.
CREATE TABLE IF NOT EXISTS sessions (
	token_hash TEXT PRIMARY KEY,
	user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	expires_at TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

CREATE TABLE IF NOT EXISTS children (
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	first_name   TEXT NOT NULL,
	last_name    TEXT,
	dob          TEXT,                               -- ISO date (YYYY-MM-DD)
	allergies    TEXT,
	parent_name  TEXT,
	parent_email TEXT,
	parent_phone TEXT,
	status       TEXT NOT NULL DEFAULT 'active',     -- 'active' | 'inactive'
	created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_children_status ON children (status, last_name, first_name);

CREATE TABLE IF NOT EXISTS notes (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	child_id   INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
	author_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
	body       TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notes_child ON notes (child_id, created_at DESC);
