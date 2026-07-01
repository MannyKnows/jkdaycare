import type { APIRoute } from "astro";
import { PROGRAMS, FAQS } from "../../data/site";
import {
	SITE_TITLE,
	PHONE,
	EMAIL,
	NEIGHBORHOOD,
	LOCALITY,
	REGION,
	POSTAL_CODE,
	HOURS,
	AREAS,
	LICENSE_NUMBER,
	MAX_CAPACITY,
	PROVIDER_FIRST_NAME,
} from "../../consts";

// Server-only endpoint: calls the Gemini API with the site's knowledge base.
export const prerender = false;

// Change this if your Google AI project needs a different model.
const MODEL = "gemini-2.5-flash";
const geminiUrl = (model: string, key: string) =>
	`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

function knowledgeBase(): string {
	const programs = PROGRAMS.map(
		(p) =>
			`- ${p.name} (${p.ageRange}): ${p.focus} ${p.blurb} Highlights: ${p.highlights.join("; ")}.`,
	).join("\n");
	const faqs = FAQS.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n");
	return [
		`Business: ${SITE_TITLE} — a small, licensed family child care (home-based).`,
		`Provider: ${PROVIDER_FIRST_NAME} (licensed provider).`,
		`Location: the ${NEIGHBORHOOD} neighborhood of ${LOCALITY}, ${REGION} ${POSTAL_CODE}. The exact street address is shared when a family schedules a tour — do not provide a street address.`,
		`Service area: ${AREAS}.`,
		`Hours: ${HOURS}.`,
		`Phone: ${PHONE}. Email: ${EMAIL}.`,
		`Ages served: 2 to 6 years. Capacity: a small group of up to ${MAX_CAPACITY} children. Licensed by the Massachusetts Department of Early Education & Care (EEC), license #${LICENSE_NUMBER}. Staff are CPR & First-Aid certified. Nutritious meals (breakfast, lunch, snacks) are included. Accepts childcare financial assistance including NEFWC vouchers.`,
		"",
		`What we focus on at each stage:\n${programs}`,
		"",
		`FAQs:\n${faqs}`,
	].join("\n");
}

const SYSTEM = `You are the friendly, concise virtual assistant for ${SITE_TITLE}, a small licensed family child care in Springfield, MA.
Answer parents' questions using ONLY the information below. Keep replies short (1-3 sentences) and warm.
If something isn't covered, say you're not certain and suggest calling ${PHONE} or scheduling a tour.
Never invent prices, availability, policies, or medical/legal advice. Encourage booking a tour when it fits.

KNOWLEDGE BASE:
${knowledgeBase()}`;

interface IncomingMessage {
	role?: string;
	text?: string;
}

interface GeminiResponse {
	candidates?: { content?: { parts?: { text?: string }[] } }[];
}

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

export const POST: APIRoute = async ({ request, locals }) => {
	const env = locals.runtime?.env as (Env & { GEMINI_API_KEY?: string }) | undefined;
	const key = env?.GEMINI_API_KEY;
	if (!key) return json({ error: "Chat is not configured yet." }, 503);

	let data: { messages?: IncomingMessage[] };
	try {
		data = (await request.json()) as { messages?: IncomingMessage[] };
	} catch {
		return json({ error: "Invalid request body." }, 400);
	}

	const cleaned = (Array.isArray(data.messages) ? data.messages : [])
		.filter((m) => m && typeof m.text === "string" && m.text.trim())
		.slice(-10)
		.map((m) => ({
			role: m.role === "assistant" || m.role === "model" ? "model" : "user",
			text: String(m.text).slice(0, 1000),
		}));

	if (cleaned.length === 0) return json({ error: "No message provided." }, 400);

	const payload = {
		systemInstruction: { parts: [{ text: SYSTEM }] },
		contents: cleaned.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
		generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
	};

	let res: Response;
	try {
		res = await fetch(geminiUrl(MODEL, key), {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(payload),
		});
	} catch {
		return json({ error: "The assistant is unavailable right now." }, 502);
	}

	if (!res.ok) return json({ error: "The assistant is unavailable right now." }, 502);

	const result = (await res.json().catch(() => null)) as GeminiResponse | null;
	const reply = result?.candidates?.[0]?.content?.parts
		?.map((p) => p?.text ?? "")
		.join("")
		.trim();

	if (!reply) return json({ error: "Empty response from the assistant." }, 502);
	return json({ reply });
};
