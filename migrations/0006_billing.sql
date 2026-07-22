-- Tuition ledger — processor-agnostic. Money is tracked in integer CENTS.
-- v1 flow: each child gets a billing plan (rate + cadence); the owner generates
-- the current period's charges with one tap; payments are recorded manually
-- (Zelle / check / cash / card) against a charge. Balance = unpaid charges.
-- If Stripe is connected later, its webhook will insert into `payments` the
-- same way a manual "mark paid" does — nothing here changes.

CREATE TABLE IF NOT EXISTS billing_plans (
	child_id     INTEGER PRIMARY KEY REFERENCES children(id) ON DELETE CASCADE,
	amount_cents INTEGER NOT NULL,
	cadence      TEXT NOT NULL DEFAULT 'weekly',   -- 'weekly' | 'monthly'
	active       INTEGER NOT NULL DEFAULT 1,
	updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS charges (
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	child_id     INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
	period_key   TEXT,                             -- '2026-07-20' (week) / '2026-07' (month); NULL for one-offs
	label        TEXT NOT NULL,                    -- 'Week of Jul 20' / 'July 2026' / 'Late pickup fee'
	amount_cents INTEGER NOT NULL,
	status       TEXT NOT NULL DEFAULT 'due',      -- 'due' | 'paid' | 'waived'
	created_at   TEXT NOT NULL DEFAULT (datetime('now')),
	-- One generated charge per child per period; NULL period_keys (one-offs)
	-- are all distinct under SQLite UNIQUE semantics, so those are unlimited.
	UNIQUE (child_id, period_key)
);
CREATE INDEX IF NOT EXISTS idx_charges_child ON charges (child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_charges_status ON charges (status);

CREATE TABLE IF NOT EXISTS payments (
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	child_id     INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
	charge_id    INTEGER REFERENCES charges(id) ON DELETE SET NULL,
	amount_cents INTEGER NOT NULL,
	method       TEXT NOT NULL DEFAULT 'zelle',    -- 'zelle' | 'check' | 'cash' | 'card' | 'other'
	note         TEXT,
	recorded_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
	created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_child ON payments (child_id, created_at DESC);
