// Money helpers. Amounts are stored as integer cents everywhere (no floats in
// the database); these convert at the UI boundary only.

/** 25000 -> "$250.00" */
export function fmtMoney(cents: number): string {
	return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** "250" | "250.5" | "$250.00" -> 25000; null for blank/invalid/negative. */
export function parseDollars(input: string | null | undefined): number | null {
	if (!input) return null;
	const n = Number(String(input).replace(/[$,\s]/g, ""));
	if (!Number.isFinite(n) || n < 0) return null;
	return Math.round(n * 100);
}

export const PAY_METHODS = ["zelle", "check", "cash", "card", "other"] as const;
export type PayMethod = (typeof PAY_METHODS)[number];
export function isPayMethod(m: string): m is PayMethod {
	return (PAY_METHODS as readonly string[]).includes(m);
}
