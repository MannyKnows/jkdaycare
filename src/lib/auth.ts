// Minimal, self-contained auth for the admin. Passwords are hashed with PBKDF2
// (Web Crypto — available in workerd). Sessions are opaque random tokens; we
// store only their SHA-256 in D1, so a database leak never exposes live logins.
// The D1 binding is loaded lazily (dynamic import) so this module can be pulled
// in by middleware during static prerendering, where `cloudflare:workers` isn't
// resolvable by the Node loader. At runtime (in the Worker) it resolves fine.
async function DB() {
	const { env } = await import("cloudflare:workers");
	return env.DB;
}

export type Role = "owner" | "staff" | "parent";

export interface User {
	id: number;
	email: string;
	role: Role;
	name: string | null;
	language: string;
}

const enc = new TextEncoder();
const PBKDF2_ITER = 100_000;
export const COOKIE = "jk_session";
const SESSION_DAYS = 14;

function toHex(buf: ArrayBuffer): string {
	return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function fromHex(hex: string): Uint8Array<ArrayBuffer> {
	const out = new Uint8Array(hex.length / 2);
	for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	return out;
}
async function sha256Hex(input: string): Promise<string> {
	return toHex(await crypto.subtle.digest("SHA-256", enc.encode(input)));
}
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
		"deriveBits",
	]);
	const bits = await crypto.subtle.deriveBits(
		{ name: "PBKDF2", salt, iterations: PBKDF2_ITER, hash: "SHA-256" },
		key,
		256,
	);
	return `pbkdf2$${PBKDF2_ITER}$${toHex(salt.buffer)}$${toHex(bits)}`;
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
	if (!stored) return false;
	const [scheme, iterStr, saltHex, hashHex] = stored.split("$");
	if (scheme !== "pbkdf2" || !saltHex || !hashHex) return false;
	const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
		"deriveBits",
	]);
	const bits = await crypto.subtle.deriveBits(
		{ name: "PBKDF2", salt: fromHex(saltHex), iterations: parseInt(iterStr, 10), hash: "SHA-256" },
		key,
		256,
	);
	return timingSafeEqual(toHex(bits), hashHex);
}

/** A fresh 256-bit random token, hex-encoded. Used for invites and sessions. */
export function randomToken(): string {
	return toHex(crypto.getRandomValues(new Uint8Array(32)).buffer);
}

/** SHA-256 of a token, hex. We store this (never the raw token) at rest. */
export async function hashToken(token: string): Promise<string> {
	return sha256Hex(token);
}

export async function createSession(userId: number): Promise<string> {
	const token = toHex(crypto.getRandomValues(new Uint8Array(32)).buffer);
	const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
	const db = await DB();
	await db
		.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?1, ?2, ?3)")
		.bind(await sha256Hex(token), userId, expires)
		.run();
	return token;
}

export async function destroySession(token: string): Promise<void> {
	const db = await DB();
	await db.prepare("DELETE FROM sessions WHERE token_hash = ?1").bind(await sha256Hex(token)).run();
}

export async function userFromToken(token: string | undefined): Promise<User | null> {
	if (!token) return null;
	const db = await DB();
	const row = await db.prepare(
		`SELECT u.id, u.email, u.role, u.name, u.language
		 FROM sessions s JOIN users u ON u.id = s.user_id
		 WHERE s.token_hash = ?1 AND s.expires_at > datetime('now')`,
	)
		.bind(await sha256Hex(token))
		.first<User>();
	return row ?? null;
}

export function sessionCookie(token: string): string {
	return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86_400}`;
}
export function clearCookie(): string {
	return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readCookie(request: Request, name: string): string | undefined {
	const header = request.headers.get("cookie");
	if (!header) return undefined;
	for (const part of header.split(";")) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
	}
	return undefined;
}
