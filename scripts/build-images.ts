/**
 * Generates responsive AVIF/WebP variants and Open Graph crops for every
 * original in media/originals into public/. Incremental: a variant is only
 * re-encoded when its original is newer, so dev restarts stay fast.
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import { availableParallelism } from "node:os";
import path from "node:path";
import sharp, { type Sharp } from "sharp";
import { mediaKey } from "../lib/strapi";
import {
  IMAGE_OUTPUT_DIR,
  OG_OUTPUT_DIR,
  OG_SIZE,
  PORTRAIT_ASPECT,
  PORTRAIT_WIDTHS,
  needsPortraitCrop,
  ogFile,
  portraitFile,
  variantFile,
  variantWidths,
} from "../lib/images";

const ROOT = path.resolve(import.meta.dirname, "..");
const ORIGINALS = path.join(ROOT, "media", "originals");
const PUBLIC = path.join(ROOT, "public");
const SOURCE_EXT = /\.(jpe?g|png|webp|avif|tiff?)$/i;

type Job = { out: string; run: () => Promise<unknown> };

async function isFresh(out: string, sourceMtime: number): Promise<boolean> {
  try {
    return (await stat(out)).mtimeMs >= sourceMtime;
  } catch {
    return false;
  }
}

async function jobsFor(file: string): Promise<Job[]> {
  const source = path.join(ORIGINALS, file);
  const key = mediaKey(file);
  const { mtimeMs } = await stat(source);
  const { width, height } = await sharp(source).metadata();
  if (!width) throw new Error(`Cannot read dimensions of ${file}`);

  const job = (file: string, encode: (img: Sharp) => Sharp): Job => {
    const out = path.join(PUBLIC, file);
    return { out, run: () => encode(sharp(source)).toFile(out) };
  };
  const jobs: Job[] = variantWidths(width).flatMap((w) => [
    // AVIF at q50 is visually on par with WebP q75 at roughly 60% of the bytes.
    job(variantFile(key, w, "avif"), (img) => img.resize({ width: w }).avif({ quality: 50, effort: 4 })),
    job(variantFile(key, w, "webp"), (img) => img.resize({ width: w }).webp({ quality: 75 })),
  ]);
  if (needsPortraitCrop({ width, height: height ?? width })) {
    for (const w of PORTRAIT_WIDTHS) {
      const crop = { width: w, height: Math.round((w * PORTRAIT_ASPECT.height) / PORTRAIT_ASPECT.width) };
      const cropped = (img: Sharp) => img.resize({ ...crop, fit: "cover", position: "attention" });
      jobs.push(job(portraitFile(key, w, "avif"), (img) => cropped(img).avif({ quality: 50, effort: 4 })));
      jobs.push(job(portraitFile(key, w, "webp"), (img) => cropped(img).webp({ quality: 75 })));
    }
  }
  jobs.push(
    job(ogFile(key), (img) =>
      img.resize({ ...OG_SIZE, fit: "cover", position: "attention" }).jpeg({ quality: 80, mozjpeg: true }),
    ),
  );

  const pending: Job[] = [];
  for (const job of jobs) if (!(await isFresh(job.out, mtimeMs))) pending.push(job);
  return pending;
}

async function runPool(jobs: Job[], concurrency: number): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++]!;
      await job.run();
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}

async function main() {
  await mkdir(path.join(PUBLIC, IMAGE_OUTPUT_DIR), { recursive: true });
  await mkdir(path.join(PUBLIC, OG_OUTPUT_DIR), { recursive: true });
  const files = (await readdir(ORIGINALS)).filter((f) => SOURCE_EXT.test(f));
  const jobs = (await Promise.all(files.map(jobsFor))).flat();
  const started = performance.now();
  // sharp already uses libvips threads per image; a small pool keeps memory bounded.
  await runPool(jobs, Math.max(2, Math.floor(availableParallelism() / 2)));
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  console.log(`images: ${files.length} originals, ${jobs.length} variants encoded in ${seconds}s`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
