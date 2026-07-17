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
