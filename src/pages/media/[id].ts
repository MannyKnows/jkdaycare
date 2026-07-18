// Serves a photo from the private R2 bucket, with per-child access control.
// Staff (owner/staff) can load any photo; a parent only photos of children
// linked to them. Nothing in the bucket is ever publicly reachable.
export const prerender = false;

import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const GET: APIRoute = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) return new Response("Unauthorized", { status: 401 });

	const id = Number(params.id);
	if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });

	const row = await env.DB.prepare(
		"SELECT r2_key, content_type, child_id FROM media WHERE id = ?1",
	)
		.bind(id)
		.first<{ r2_key: string; content_type: string | null; child_id: number }>();
	if (!row) return new Response("Not found", { status: 404 });

	const isStaff = user.role === "owner" || user.role === "staff";
	if (!isStaff) {
		const link = await env.DB.prepare(
			"SELECT 1 AS ok FROM child_parents WHERE child_id = ?1 AND user_id = ?2",
		)
			.bind(row.child_id, user.id)
			.first<{ ok: number }>();
		if (!link) return new Response("Forbidden", { status: 403 });
	}

	const obj = await env.MEDIA.get(row.r2_key);
	if (!obj) return new Response("Not found", { status: 404 });

	return new Response(obj.body, {
		headers: {
			"content-type": row.content_type ?? "image/jpeg",
			// Private: only the signed-in viewer's browser may cache it.
			"cache-control": "private, max-age=86400",
		},
	});
};
