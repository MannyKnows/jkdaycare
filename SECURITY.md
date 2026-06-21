# Security notes — jkdaycare.com

This documents the response to the Cloudflare Security Insights scan
(`Cloudflare_MannyKnows_SecurityInsights`, 2026-06-20) for **jkdaycare.com**.

The scan reported four `Moderate` findings for this domain. They fall into two
groups: things fixed in this repository, and Cloudflare **zone settings** that
must be toggled in the dashboard (they are account/edge configuration, not code,
so they can't be changed from here).

## Fixed in code

### Domains without HSTS — ✅ fixed

Security response headers are now served on every request:

- **Static pages & assets** (the entire public site): [`public/_headers`](public/_headers),
  which Cloudflare Workers Static Assets applies at the edge.
- **Dynamic responses** (e.g. `POST /api/signup`): [`src/middleware.ts`](src/middleware.ts).

Headers added:

| Header | Value | Purpose |
| --- | --- | --- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Fixes the HSTS finding — forces HTTPS for 1 year, incl. subdomains |
| `Content-Security-Policy` | see file | Restricts where scripts/styles/fonts/images/connections may load from; `upgrade-insecure-requests` auto-upgrades any `http://` subresource |
| `X-Content-Type-Options` | `nosniff` | Blocks MIME-type sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Anti-clickjacking (paired with CSP `frame-ancestors 'self'`) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=(), payment=()` | Disables browser features the site doesn't use |

The CSP allows Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) and
inline styles/scripts because Astro inlines the page's small `<style>` and
`<script>` blocks at build time. If those external dependencies or the inline
script/style change, update the CSP in **both** files together.

> **Optional:** to harden further you can submit the domain to the
> [HSTS preload list](https://hstspreload.org/) and add `; preload` to the
> `max-age` value. Do this only once every subdomain is HTTPS-only — it is slow
> to reverse.

## Requires Cloudflare dashboard (cannot be changed from this repo)

Log in to the Cloudflare dashboard, select the **jkdaycare.com** zone, and:

1. **Bot Fight Mode not enabled** → **Security → Bots** → turn on **Bot Fight Mode**.
   (Review challenged traffic later under **Security → Events**.)
2. **Domains missing TLS Encryption** → **SSL/TLS → Overview** → set the
   encryption mode to **Full (strict)** so the origin is reached over HTTPS.
3. **Domains without "Always Use HTTPS"** → **SSL/TLS → Edge Certificates** →
   enable **Always Use HTTPS** (301-redirects HTTP → HTTPS at the edge).

> **Note on HSTS:** the `Strict-Transport-Security` header is now sent from
> code (above). There's no need to *also* enable HSTS under
> **SSL/TLS → Edge Certificates** in the dashboard — doing both can emit a
> duplicate header. Manage it in one place; this repo is that place.

## Other domains in the report

The uploaded CSV also lists findings for unrelated domains (e.g. `cherryvibes.com`,
`grupo506.xyz`, `vlhomeservices.com`, `slpainting.homes`, `opscloud.us`). Those
are outside this repository and are not addressed here.
