// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

/**
 * Force Astro's SSR renderer off its Node.js async-iterable path.
 *
 * Cloudflare's `nodejs_compat` flag makes Astro's internal `isNode` runtime
 * check evaluate true inside workerd. With streaming on (the default), Astro
 * then builds the response body via `renderToAsyncIterable()`. workerd's
 * `Response` constructor does not accept an async iterable as a body, so it
 * coerces the object to a string and every SSR page renders as the literal
 * text "[object Object]".
 *
 * The Cloudflare adapter creates the app with `createApp()` and exposes no
 * streaming option, so we rewrite that single call to `createApp({ streaming:
 * false })`. Astro then renders each page to a string and encodes it to bytes,
 * which every runtime serves correctly. Our pages are small, so buffering the
 * whole document instead of streaming it costs nothing.
 */
function disableSsrStreaming() {
	return {
		name: "jk-disable-ssr-streaming",
		enforce: /** @type {const} */ ("pre"),
		transform(/** @type {string} */ code, /** @type {string} */ id) {
			if (id.includes("@astrojs/cloudflare") && id.includes("handler") && code.includes("createApp()")) {
				return code.replace("createApp()", "createApp({ streaming: false })");
			}
			return null;
		},
	};
}

// https://astro.build/config
export default defineConfig({
	site: "https://jkdaycare.com",
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [disableSsrStreaming()],
	},
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
