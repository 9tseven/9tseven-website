import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { argv } from "node:process";

type Point = [number, number];

interface Args {
  in: string;
  out: string;
  count: number;
  threshold: number;
  seed: number;
}

/** mulberry32 — a fast, seedable 32-bit PRNG. Returns values in [0, 1). */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

function parseArgs(): Args {
  const args: Partial<Args> = { count: 2500, threshold: 180, seed: 42 };
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "") as keyof Args;
    const value = argv[i + 1];
    switch (key) {
      case "count":
        args.count = Number(value);
        break;
      case "threshold":
        args.threshold = Number(value);
        break;
      case "seed":
        args.seed = Number(value);
        break;
      case "in":
        args.in = value;
        break;
      case "out":
        args.out = value;
        break;
    }
  }
  if (!args.in || !args.out) {
    throw new Error("Usage: --in <path> --out <path> [--count N] [--threshold 0-255] [--seed N]");
  }
  if (!Number.isFinite(args.count)) {
    throw new Error(`Invalid --count value: ${args.count}`);
  }
  if (!Number.isFinite(args.threshold)) {
    throw new Error(`Invalid --threshold value: ${args.threshold}`);
  }
  if (!Number.isFinite(args.seed) || (args.seed as number) <= 0) {
    throw new Error(`Invalid --seed value: ${args.seed} (must be a positive integer)`);
  }
  return args as Args;
}

async function loadGreyscale(path: string) {
  const { data, info } = await sharp(path)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function findBlobs(data: Buffer, width: number, height: number, threshold: number): Point[] {
  const visited = new Uint8Array(width * height);
  const centroids: Point[] = [];
  const stack: number[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx] || data[idx] < threshold) continue;
      let sumX = 0;
      let sumY = 0;
      let n = 0;
      stack.push(idx);
      visited[idx] = 1;
      while (stack.length) {
        const i = stack.pop()!;
        const px = i % width;
        const py = (i - px) / width;
        sumX += px;
        sumY += py;
        n++;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = px + dx;
            const ny = py + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const ni = ny * width + nx;
            if (visited[ni] || data[ni] < threshold) continue;
            visited[ni] = 1;
            stack.push(ni);
          }
        }
      }
      centroids.push([sumX / n, sumY / n]);
    }
  }
  return centroids;
}

function normalizeCount(points: Point[], target: number, rand: () => number): Point[] {
  if (points.length === 0) {
    throw new Error("No blobs found above threshold — try a lower --threshold.");
  }
  if (points.length === target) return points;
  if (points.length > target) {
    // Seeded Fisher-Yates shuffle over an index array; take the first `target`
    // indices sorted ascending so the output order matches original traversal
    // order (preserves chaotic-organic morph behaviour).
    const indices = Array.from({ length: points.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = indices[i];
      indices[i] = indices[j];
      indices[j] = tmp;
    }
    return indices
      .slice(0, target)
      .sort((a, b) => a - b)
      .map((i) => points[i]);
  }
  const filled = [...points];
  while (filled.length < target) {
    const source = filled[Math.floor(rand() * points.length)];
    filled.push([
      source[0] + (rand() - 0.5) * 2,
      source[1] + (rand() - 0.5) * 2,
    ]);
  }
  return filled;
}

function normalizeCoords(points: Point[], width: number, height: number): Point[] {
  const longSide = Math.max(width, height);
  const offsetX = (longSide - width) / 2;
  const offsetY = (longSide - height) / 2;
  return points.map(([x, y]) => [
    ((x + offsetX) / longSide) * 2 - 1,
    ((y + offsetY) / longSide) * 2 - 1,
  ]);
}

async function main() {
  const args = parseArgs();
  const rand = mulberry32(args.seed);
  const { data, width, height } = await loadGreyscale(args.in);
  const blobs = findBlobs(data, width, height, args.threshold);
  const sized = normalizeCount(blobs, args.count, rand);
  const normalized = normalizeCoords(sized, width, height);
  const sourceImage = args.in.split("/").pop() ?? args.in;
  const output = {
    points: normalized,
    sourceImage,
    count: normalized.length,
  };
  await writeFile(args.out, JSON.stringify(output));
  console.log(
    `Extracted ${blobs.length} blobs from ${args.in}, sampled to ${normalized.length}, wrote ${args.out}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
