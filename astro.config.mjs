// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://jkdaycare.com",
	integrations: [mdx(), sitemap()],
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
			// Workers AI (env.AI) has no local emulator; without this, `astro dev`
			// tries to open a remote proxy session and fails unless you're logged
			// into Cloudflare. Keeping remote bindings off lets dev boot and use the
			// deterministic chat fallback; the AI model runs in production.
			experimental: { remoteBindings: false },
		},
	}),
});
