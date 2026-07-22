// Nightly cron (23:00 UTC ≈ 6–7pm in Springfield): email every linked parent
// the evening before any calendar events marked "notify", in the parent's
// language. Wired into the Worker's `scheduled` export by the
// jk-worker-scheduled Vite plugin in astro.config.mjs.

import { env } from "cloudflare:workers";
import { tomorrow, fmtDateOnly } from "./day";
import { sendEmail, emailConfigured } from "./email";

interface EventRow {
	id: number;
	date: string;
	title: string;
	note: string | null;
}
interface ParentRow {
	email: string;
	name: string | null;
	language: string;
}

function esc(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildEmail(events: EventRow[], lang: string, name: string | null) {
	const es = lang === "es";
	const dayLabel = fmtDateOnly(events[0].date, es ? "es-US" : "en-US");
	const subject = es ? `Mañana en J&K Daycare — ${dayLabel}` : `Tomorrow at J&K Daycare — ${dayLabel}`;
	const hi = es ? `Hola${name ? ` ${name.split(" ")[0]}` : ""},` : `Hi${name ? ` ${name.split(" ")[0]}` : ""},`;
	const intro = es ? "Esto es lo que tenemos planeado para mañana:" : "Here's what we have planned for tomorrow:";
	const outro = es
		? "¿Preguntas? Simplemente responda a este correo. — Magaly, J&K Daycare"
		: "Questions? Just reply to this email. — Magaly, J&K Daycare";

	const itemsText = events.map((e) => `• ${e.title}${e.note ? ` — ${e.note}` : ""}`).join("\n");
	const itemsHtml = events
		.map(
			(e) =>
				`<li style="margin:0 0 8px"><strong>${esc(e.title)}</strong>${e.note ? ` — ${esc(e.note)}` : ""}</li>`,
		)
		.join("");

	return {
		subject,
		text: `${hi}\n\n${intro}\n\n${itemsText}\n\n${outro}`,
		html: `<div style="font-family:sans-serif;font-size:16px;color:#212149;line-height:1.6">
<p>${esc(hi)}</p><p>${esc(intro)}</p><ul style="padding-left:20px">${itemsHtml}</ul><p>${esc(outro)}</p></div>`,
	};
}

export async function scheduled(): Promise<void> {
	const day = tomorrow();

	const { results: events } = await env.DB.prepare(
		`SELECT id, date, title, note FROM events
		 WHERE date = ?1 AND notify = 1 AND notified_at IS NULL ORDER BY id`,
	)
		.bind(day)
		.all<EventRow>();
	if (events.length === 0) return;

	const { results: parents } = await env.DB.prepare(
		`SELECT DISTINCT u.email, u.name, u.language
		 FROM users u
		 JOIN child_parents cp ON cp.user_id = u.id
		 JOIN children c ON c.id = cp.child_id AND c.status = 'active'
		 WHERE u.role = 'parent'`,
	).all<ParentRow>();

	if (!emailConfigured()) {
		// Leave notified_at NULL: once the key exists, a future run can still
		// send (for whatever is "tomorrow" then). Log so the gap is visible.
		await env.DB.prepare(
			`INSERT INTO email_log (to_email, subject, status, detail) VALUES ('—', ?1, 'skipped_no_key', ?2)`,
		)
			.bind(
				`Reminder for ${day}`,
				`${events.length} event(s), ${parents.length} parent(s) — RESEND_API_KEY not set`,
			)
			.run();
		return;
	}

	let anySent = false;
	for (const p of parents) {
		const msg = buildEmail(events, p.language, p.name);
		const res = await sendEmail({ to: p.email, subject: msg.subject, html: msg.html, text: msg.text });
		if (res.status === "sent") anySent = true;
		await env.DB.prepare(
			`INSERT INTO email_log (to_email, subject, status, detail) VALUES (?1, ?2, ?3, ?4)`,
		)
			.bind(p.email, msg.subject, res.status, res.detail ?? null)
			.run();
	}

	if (anySent) {
		await env.DB.batch(
			events.map((e) =>
				env.DB.prepare(`UPDATE events SET notified_at = datetime('now') WHERE id = ?1`).bind(e.id),
			),
		);
	}
}
