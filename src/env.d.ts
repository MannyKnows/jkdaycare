/// <reference types="astro/client" />

// In Astro v6+ the Cloudflare adapter removed `Astro.locals.runtime.env`.
// Bindings are now accessed through the `cloudflare:workers` virtual module,
// which the adapter resolves at build time. Declare it so TypeScript can type
// `env` as our generated Env (see worker-configuration.d.ts).
declare module "cloudflare:workers" {
	export const env: Env;
}

declare namespace App {
	interface Locals {
		user: import("./lib/auth").User | null;
	}
}
