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
		// Prerender static pages in Node instead of workerd. Our static pages use
		// no runtime bindings, and workerd prerendering would open a remote session
		// for the AI binding (which has no local emulator), failing the build in CI
		// where there are no Cloudflare credentials.
		prerenderEnvironment: "node",
		// The site serves images straight from public/ (no <Image>/astro:assets),
		// so skip the Cloudflare Images runtime binding the adapter enables by
		// default. Passthrough serves images as-is, matching current behavior.
		imageService: "passthrough",
	}),
});
