// Build-time image optimizer.
//
// Runs before `astro build` (see the "build" script in package.json). It walks
// public/ and shrinks any oversized raster image in place, so whatever gets
// deployed to Cloudflare is web-ready — even when someone drops a full-res
// photo straight into the repo via the GitHub web UI.
//
// It is intentionally FAILSAFE: any problem (missing sharp, a bad file) is
// logged and skipped, never thrown, so it can't break a deploy. It is also
// idempotent — already-small images are left untouched, so re-runs are cheap.

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const DIR = "public";
const MAX_WIDTH = 1600; // hero/content images never render wider than this (incl. retina)
const MAX_BYTES = 400 * 1024; // leave anything already under this alone
const JPEG = { quality: 80, progressive: true, mozjpeg: true };
const RASTER = new Set([".jpg", ".jpeg", ".png"]);

let sharp;
try {
	sharp = (await import("sharp")).default;
} catch {
	console.warn("[optimize-images] sharp unavailable — skipping (build continues).");
	process.exit(0);
}

function walk(dir) {
	const out = [];
	let entries = [];
	try {
		entries = readdirSync(dir);
	} catch {
		return out;
	}
	for (const name of entries) {
		const p = join(dir, name);
		const st = statSync(p);
		if (st.isDirectory()) out.push(...walk(p));
		else out.push(p);
	}
	return out;
}

let changed = 0;
let saved = 0;
for (const file of walk(DIR)) {
	const ext = extname(file).toLowerCase();
	if (!RASTER.has(ext)) continue;
	try {
		const before = statSync(file).size;
		const meta = await sharp(file).metadata();
		const width = meta.width || 0;
		if (before <= MAX_BYTES && width <= MAX_WIDTH) continue; // already fine

		let pipe = sharp(file).rotate(); // bake in EXIF orientation
		if (width > MAX_WIDTH) pipe = pipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
		const buf =
			ext === ".png"
				? await pipe.png({ compressionLevel: 9 }).toBuffer()
				: await pipe.jpeg(JPEG).toBuffer();

		if (buf.length < before) {
			writeFileSync(file, buf);
			saved += before - buf.length;
			changed++;
			console.log(
				`[optimize-images] ${file}: ${Math.round(before / 1024)}KB -> ${Math.round(buf.length / 1024)}KB`,
			);
		}
	} catch (err) {
		console.warn(`[optimize-images] skip ${file}: ${err.message}`);
	}
}
console.log(
	`[optimize-images] ${changed} file(s) optimized, ${Math.round(saved / 1024)}KB saved.`,
);
