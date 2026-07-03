import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

// This endpoint writes to D1, so it must run on the server (not be prerendered).
export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

export const POST: APIRoute = async ({ request }) => {
	// Accept either JSON (from the page's fetch) or a classic form POST.
	let data: Record<string, unknown> = {};
	const contentType = request.headers.get("content-type") ?? "";
	try {
		if (contentType.includes("application/json")) {
			data = (await request.json()) as Record<string, unknown>;
		} else {
			const form = await request.formData();
			data = Object.fromEntries(form.entries());
		}
	} catch {
		return json({ ok: false, error: "Invalid request body." }, 400);
	}

	const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

	// Honeypot: real visitors never fill this hidden field, bots usually do.
	if (str(data.company)) {
		return json({ ok: true });
	}

	const name = str(data.name);
	const email = str(data.email).toLowerCase();
	const phone = str(data.phone);
	const address = str(data.address);

	const errors: Record<string, string> = {};
	if (!name) errors.name = "Please enter your name.";
	if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
	if (!phone) errors.phone = "Please enter a phone number.";
	if (Object.keys(errors).length > 0) {
		return json({ ok: false, error: "Please check the highlighted fields.", errors }, 400);
	}

	const db = env.DB;
	if (!db) {
		return json(
			{ ok: false, error: "Sign-ups aren't available right now. Please try again later." },
			503,
		);
	}

	try {
		await db
			.prepare(
				`INSERT INTO signups (name, email, phone, address)
				 VALUES (?1, ?2, ?3, ?4)
				 ON CONFLICT(email) DO UPDATE SET
				   name = excluded.name,
				   phone = excluded.phone,
				   address = excluded.address,
				   created_at = datetime('now')`,
			)
			.bind(name, email, phone, address || null)
			.run();
	} catch {
		return json({ ok: false, error: "Something went wrong saving your details." }, 500);
	}

	return json({ ok: true });
};
