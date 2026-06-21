import { defineMiddleware } from "astro:middleware";

// Security headers for on-demand (SSR) responses such as /api/signup.
//
// Static pages and assets receive the same headers via public/_headers, which
// Cloudflare Workers Static Assets serves directly at the edge (those requests
// never reach this Worker). Keeping both in sync gives every response the same
// protections. Values must match public/_headers.
const SECURITY_HEADERS: Record<string, string> = {
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "SAMEORIGIN",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()",
	"Content-Security-Policy":
		"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests",
};

export const onRequest = defineMiddleware(async (_context, next) => {
	const response = await next();
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		// Don't clobber a header a route deliberately set.
		if (!response.headers.has(name)) {
			response.headers.set(name, value);
		}
	}
	return response;
});
