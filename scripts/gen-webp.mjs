/**
 * gen-webp.mjs
 * Generates responsive WebP variants for hero/feature images and all archive
 * gallery images. Runs automatically before `pnpm build` via the "prebuild"
 * npm hook.
 *
 * Skip logic: if the output .webp file already exists, it is skipped. To force
 * regeneration, delete the matching *-NNNpx.webp files and re-run / re-build.
 */

import sharp from "sharp";
import { existsSync, readdirSync } from "fs";
import { resolve, dirname, basename, extname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Hero / feature images — multiple responsive widths
// ---------------------------------------------------------------------------
const heroImages = [
  {
    src: "assets/img/home/sokolski-dom-djordje-tabakovic-crtez.jpg",
    widths: [480, 800, 1200, 1600],
  },
  {
    src: "assets/img/home/sokolski-dom-danas.jpg",
    widths: [480, 800, 1000],
  },
  {
    src: "assets/img/home/sokolski-dom-120-godina.jpg",
    widths: [480, 800, 1200, 1600],
  },
  {
    src: "assets/img/arhiv/hero/sokolski-dom-arhiv-u-slikama-hero.jpg",
    widths: [480, 800, 1200, 1600],
  },
];

// ---------------------------------------------------------------------------
// Gallery images — 400 and 800px (3-column grid, max ~360px rendered)
// ---------------------------------------------------------------------------
const GALLERY_WIDTHS = [400, 800];
const GALLERY_DIR = resolve(root, "assets/img/arhiv");
const HERO_DIR = resolve(root, "assets/img/arhiv/hero");

/** Recursively collect all .jpg paths under `dir`, excluding `excludeDir`. */
function findJpgs(dir, excludeDir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full !== excludeDir) results.push(...findJpgs(full, excludeDir));
    } else if (entry.name.toLowerCase().endsWith(".jpg")) {
      results.push(full);
    }
  }
  return results;
}

const galleryImages = findJpgs(GALLERY_DIR, HERO_DIR).map((absPath) => ({
  src: absPath.replace(root + "/", ""),
  widths: GALLERY_WIDTHS,
}));

// ---------------------------------------------------------------------------
// Process all images
// ---------------------------------------------------------------------------
let generated = 0;
let skipped = 0;

async function processImage(src, widths) {
  const srcAbs = resolve(root, src);
  const dir = dirname(srcAbs);
  const stem = basename(src, extname(src));

  for (const w of widths) {
    const out = resolve(dir, `${stem}-${w}px.webp`);
    if (existsSync(out)) {
      skipped++;
      continue;
    }
    await sharp(srcAbs).resize(w).webp({ quality: 82 }).toFile(out);
    console.log(`  generated ${src.replace("assets/", "")} → ${stem}-${w}px.webp`);
    generated++;
  }
}

for (const { src, widths } of heroImages) {
  await processImage(src, widths);
}

for (const { src, widths } of galleryImages) {
  await processImage(src, widths);
}

if (generated === 0 && skipped > 0) {
  console.log(`  WebP variants up to date (${skipped} files)`);
} else {
  console.log(
    `  WebP generation done: ${generated} new, ${skipped} skipped` +
    ` (${heroImages.length} hero + ${galleryImages.length} gallery images)`
  );
}
