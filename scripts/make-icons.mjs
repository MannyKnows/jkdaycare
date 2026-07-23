// Generate the favicon/home-screen PNGs from public/logo.svg.
// Run manually after changing the logo:  node scripts/make-icons.mjs
//
// Why PNGs exist at all: iOS Safari doesn't support SVG favicons, so without
// these the J&K logo never shows in mobile tabs, bookmarks, or on the home
// screen. Apple touch icons must have a solid background (transparency turns
// black on iOS), so that one gets the brand cream; the rest stay transparent.

import sharp from "sharp";
import { readFileSync } from "node:fs";

const svg = readFileSync("public/logo.svg");

async function icon(size, out, { bg = null, pad = 0.12 } = {}) {
	const inner = Math.round(size * (1 - pad * 2));
	const logo = await sharp(svg, { density: 300 })
		.resize(inner, inner, { fit: "inside" })
		.png()
		.toBuffer();
	const meta = await sharp(logo).metadata();
	await sharp({
		create: {
			width: size,
			height: size,
			channels: 4,
			background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 },
		},
	})
		.composite([
			{
				input: logo,
				left: Math.round((size - meta.width) / 2),
				top: Math.round((size - meta.height) / 2),
			},
		])
		.png()
		.toFile(out);
	console.log("wrote", out, `${size}px`);
}

const cream = { r: 246, g: 241, b: 232, alpha: 1 };
await icon(180, "public/apple-touch-icon.png", { bg: cream, pad: 0.1 });
await icon(96, "public/favicon-96x96.png");
await icon(192, "public/icon-192.png");
await icon(512, "public/icon-512.png");
