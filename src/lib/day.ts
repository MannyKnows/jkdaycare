// Date/time helpers for the admin, all anchored to the provider's local zone
// (the daycare is in Springfield, MA). The Worker runs in UTC, so "today" and
// any displayed time must be converted explicitly or the day will roll at the
// wrong moment.

export const TZ = "America/New_York";

/** Provider-local calendar date as YYYY-MM-DD (en-CA formats that way). */
export function today(): string {
	return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Current instant as ISO-8601 UTC, for storing in attendance timestamps. */
export function nowISO(): string {
	return new Date().toISOString();
}

// SQLite's datetime('now') returns "YYYY-MM-DD HH:MM:SS" in UTC with no zone
// marker. Normalize both that shape and real ISO strings to a Date.
function toDate(s: string): Date {
	const iso = s.includes("T") ? s : s.replace(" ", "T") + "Z";
	return new Date(iso);
}

/** e.g. "3:05 PM" in provider-local time, or "" for null. */
export function fmtTime(s: string | null | undefined): string {
	if (!s) return "";
	return toDate(s).toLocaleTimeString("en-US", {
		timeZone: TZ,
		hour: "numeric",
		minute: "2-digit",
	});
}

/** e.g. "Jul 17, 3:05 PM" in provider-local time. */
export function fmtDateTime(s: string | null | undefined): string {
	if (!s) return "";
	return toDate(s).toLocaleString("en-US", {
		timeZone: TZ,
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

/** Provider-local calendar date (YYYY-MM-DD) of a stored timestamp. */
export function localDay(s: string): string {
	return toDate(s).toLocaleDateString("en-CA", { timeZone: TZ });
}

/** e.g. "Fri, Jul 17" in provider-local time. */
export function fmtDate(s: string | null | undefined): string {
	if (!s) return "";
	return toDate(s).toLocaleDateString("en-US", {
		timeZone: TZ,
		weekday: "short",
		month: "short",
		day: "numeric",
	});
}

/** Provider-local date N days after a YYYY-MM-DD string (calendar math). */
export function addDays(dateStr: string, n: number): string {
	const [y, m, d] = dateStr.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d + n));
	return dt.toISOString().slice(0, 10);
}

/** Provider-local tomorrow as YYYY-MM-DD. */
export function tomorrow(): string {
	return addDays(today(), 1);
}

/** Format a bare YYYY-MM-DD (no time) as e.g. "Thu, Jul 23". */
export function fmtDateOnly(dateStr: string, locale = "en-US"): string {
	const [y, m, d] = dateStr.split("-").map(Number);
	return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, {
		timeZone: "UTC",
		weekday: "short",
		month: "short",
		day: "numeric",
	});
}

// ---- Billing periods (provider-local) -------------------------------------
// Weekly periods key on the Monday of the current week; monthly on YYYY-MM.
// All math runs on the provider-local calendar date string, so period
// boundaries roll at midnight in Springfield, not UTC.

/** { key: "2026-07-20", label: "Week of Jul 20" } for the current week. */
export function currentWeekPeriod(): { key: string; label: string } {
	const [y, m, d] = today().split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	const dow = dt.getUTCDay(); // 0 Sun … 6 Sat
	dt.setUTCDate(dt.getUTCDate() - ((dow + 6) % 7)); // back to Monday
	const key = dt.toISOString().slice(0, 10);
	const label = `Week of ${dt.toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })}`;
	return { key, label };
}

/** { key: "2026-07", label: "July 2026" } for the current month. */
export function currentMonthPeriod(): { key: string; label: string } {
	const [y, m] = today().split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, 1));
	return {
		key: `${y}-${String(m).padStart(2, "0")}`,
		label: dt.toLocaleDateString("en-US", { timeZone: "UTC", month: "long", year: "numeric" }),
	};
}
