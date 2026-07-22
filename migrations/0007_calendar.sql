-- Activity calendar + outbound-email audit log.
-- The owner plans days ahead ("Water play — bring a towel"); a nightly cron
-- (23:00 UTC ≈ 6-7pm Springfield) emails every linked parent the evening
-- before, in their language. email_log records every send attempt so the
-- admin (and the future AI assistant) can show exactly what went out.

CREATE TABLE IF NOT EXISTS events (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	date        TEXT NOT NULL,                    -- provider-local YYYY-MM-DD
	title       TEXT NOT NULL,
	note        TEXT,                             -- "what to bring" / details
	notify      INTEGER NOT NULL DEFAULT 1,       -- include in the evening-before email
	notified_at TEXT,                             -- set once the reminder email went out
	created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
	created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_date ON events (date);

CREATE TABLE IF NOT EXISTS email_log (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	to_email   TEXT NOT NULL,
	subject    TEXT NOT NULL,
	status     TEXT NOT NULL,                     -- 'sent' | 'error' | 'skipped_no_key'
	detail     TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON email_log (created_at DESC);
