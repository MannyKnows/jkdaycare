// Outbound email via Resend's HTTP API (https://resend.com/docs/api-reference).
// No SDK — one fetch call keeps the Worker lean. Degrades gracefully: when the
// RESEND_API_KEY secret isn't configured yet, sends report `skipped_no_key`
// instead of throwing, so every feature that emails can ship before the key
// exists. Callers are responsible for writing email_log rows.

import { env } from "cloudflare:workers";

export interface SendResult {
	status: "sent" | "error" | "skipped_no_key";
	detail?: string;
}

export function emailConfigured(): boolean {
	return Boolean(env.RESEND_API_KEY);
}

export async function sendEmail(opts: {
	to: string;
	subject: string;
	html: string;
	text?: string;
}): Promise<SendResult> {
	if (!env.RESEND_API_KEY) {
		return { status: "skipped_no_key" };
	}
	try {
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				authorization: `Bearer ${env.RESEND_API_KEY}`,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				from: env.EMAIL_FROM,
				to: [opts.to],
				subject: opts.subject,
				html: opts.html,
				text: opts.text,
			}),
		});
		if (!res.ok) {
			const body = await res.text();
			return { status: "error", detail: `HTTP ${res.status}: ${body.slice(0, 300)}` };
		}
		return { status: "sent" };
	} catch (err) {
		return { status: "error", detail: String(err).slice(0, 300) };
	}
}
