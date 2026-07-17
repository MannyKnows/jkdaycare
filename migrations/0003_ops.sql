-- Admin phase 1a — daily operations: attendance, daily-report activities, and
-- announcements. These are the "parent-love loop" tables: what parents will see
-- once the portal ships. All reference children/users from 0002.

-- Digital check-in/out. One row per child per day so the board can upsert.
-- Timestamps are stored as ISO-8601 UTC (from Date.toISOString); the `day` is
-- the provider-local date (America/New_York) so "today" groups correctly.
CREATE TABLE IF NOT EXISTS attendance (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	child_id   INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
	day        TEXT NOT NULL,                      -- provider-local YYYY-MM-DD
	check_in   TEXT,                               -- ISO-8601 UTC
	check_out  TEXT,                               -- ISO-8601 UTC
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	UNIQUE (child_id, day)
);
CREATE INDEX IF NOT EXISTS idx_attendance_day ON attendance (day);

-- Daily-report entries. One row per logged moment (a meal, a nap, a mood check,
-- a photo caption, a free note). `kind` drives the icon/label in the feed.
CREATE TABLE IF NOT EXISTS activities (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	child_id   INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
	author_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
	kind       TEXT NOT NULL,                      -- 'meal' | 'nap' | 'mood' | 'activity' | 'note'
	detail     TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_activities_child ON activities (child_id, created_at DESC);

-- Broadcast announcements from the owner/staff. Parent-visible once the portal
-- ships; for now they surface on the admin dashboard.
CREATE TABLE IF NOT EXISTS announcements (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	author_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
	title      TEXT NOT NULL,
	body       TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements (created_at DESC);
