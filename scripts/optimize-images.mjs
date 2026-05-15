// One-off image re-encoder. Run with `node scripts/optimize-images.mjs`.
// Re-encodes heavy WebPs in place at quality 70, capping width at 1600px.
// Skips any file where the new encoding is not smaller than the original.

import sharp from "sharp";
import { readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TARGETS = [
  "public/images/PhotoSection/photo-section1.webp",
  "public/images/PhotoSection/photo-section4.webp",
  "public/images/PhotoSection/photo-section6.webp",
  "public/images/PhotoSection/photo-section7.webp",
  "public/images/PhotoSection/MockPhotos/Community1.webp",
  "public/images/PhotoSection/MockPhotos/Community2.webp",
  "public/images/PhotoSection/MockPhotos/Community3.webp",
  "public/images/PhotoSection/MockPhotos/Community4.webp",
];

const MAX_WIDTH = 1600;
const QUALITY = 70;

function fmt(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function processOne(rel) {
  const abs = path.join(ROOT, rel);
  const input = await readFile(abs);
  const before = input.byteLength;

  const meta = await sharp(input).metadata();
  const resize = meta.width && meta.width > MAX_WIDTH ? { width: MAX_WIDTH } : null;

  const output = await sharp(input, { failOn: "none" })
    .rotate()
    .resize(resize)
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer();

  const after = output.byteLength;
  if (after >= before) {
    console.log(`skip ${rel}  (${fmt(before)} -> ${fmt(after)}, no win)`);
    return { before, after: before };
  }
  await writeFile(abs, output);
  const verified = (await stat(abs)).size;
  console.log(`ok   ${rel}  ${fmt(before)} -> ${fmt(verified)}  (-${fmt(before - verified)})`);
  return { before, after: verified };
}

const totals = { before: 0, after: 0 };
for (const rel of TARGETS) {
  const { before, after } = await processOne(rel);
  totals.before += before;
  totals.after += after;
}
console.log(`\ntotal ${fmt(totals.before)} -> ${fmt(totals.after)}  (saved ${fmt(totals.before - totals.after)})`);
