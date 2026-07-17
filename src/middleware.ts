import { defineMiddleware } from "astro:middleware";
import { COOKIE, userFromToken } from "./lib/auth";

// Security headers for on-demand (SSR) responses such as /api/signup and the
// admin. Static pages/assets receive the same headers via public/_headers,
// which Cloudflare Workers Static Assets serves directly at the edge (those
// requests never reach this Worker). Values must match public/_headers.
const SECURITY_HEADERS: Record<string, string> = {
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "SAMEORIGIN",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()",
	"Content-Security-Policy":
		"default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.google-analytics.com https://*.g.doubleclick.net https://www.google.com; connect-src 'self' https://cloudflareinsights.com https://*.google-analytics.com https://*.analytics.google.com https://*.g.doubleclick.net https://www.google.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests",
};

export const onRequest = defineMiddleware(async (context, next) => {
	const path = context.url.pathname;

	// Gate the admin area (its pages and future /api/admin routes) behind a
	// session. Only /admin/login and /admin/setup are reachable logged out.
	if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
		const user = await userFromToken(context.cookies.get(COOKIE)?.value);
		context.locals.user = user;
		const isPublic = path === "/admin/login" || path === "/admin/setup";
		const isStaff = user?.role === "owner" || user?.role === "staff";
		if (!isPublic && !isStaff) {
			if (path.startsWith("/api/")) {
				return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
					status: 401,
					headers: { "content-type": "application/json" },
				});
			}
			return context.redirect("/admin/login");
		}
	}

	// Gate the parent portal. Only /portal/login and /portal/claim (invite
	// onboarding) are reachable logged out; everything else needs a parent.
	if (path.startsWith("/portal")) {
		const user = await userFromToken(context.cookies.get(COOKIE)?.value);
		context.locals.user = user;
		const isPublic = path === "/portal/login" || path === "/portal/claim";
		if (!isPublic && user?.role !== "parent") {
			return context.redirect("/portal/login");
		}
	}

	const response = await next();
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		// Don't clobber a header a route deliberately set.
		if (!response.headers.has(name)) {
			response.headers.set(name, value);
		}
	}
	return response;
});
