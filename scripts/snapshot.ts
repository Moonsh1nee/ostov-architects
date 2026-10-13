/**
 * Pulls published content from Strapi into content/*.json (the shape the static
 * build reads) and downloads any media not yet in media/originals.
 *
 *   STRAPI_URL=http://localhost:1337 [STRAPI_TOKEN=...] npm run snapshot
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createStrapiClient, mediaKey } from "../lib/strapi";
import {
  LOCALES,
  aboutSnapshotSchema,
  homeSnapshotSchema,
  projectsSnapshotSchema,
} from "../lib/types";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT = path.join(ROOT, "content");
const ORIGINALS = path.join(ROOT, "media", "originals");

async function main() {
  const baseUrl = process.env.STRAPI_URL?.trim();
  if (!baseUrl) throw new Error("STRAPI_URL is required, e.g. STRAPI_URL=http://localhost:1337 npm run snapshot");
  const client = createStrapiClient({ baseUrl, token: process.env.STRAPI_TOKEN });

  const perLocale = await Promise.all(
    LOCALES.map(async (locale) => {
      const [projects, home, about, media] = await Promise.all([
        client.projects(locale),
        client.home(locale),
        client.about(locale),
        client.media(locale),
      ]);
      return { locale, projects, home, about, media };
    }),
  );
  const pick = <K extends "projects" | "home" | "about">(key: K) =>
    Object.fromEntries(perLocale.map((p) => [p.locale, p[key]]));

  // Same schemas as the build: a snapshot that would break the site is never written.
  const files = {
    "projects.json": projectsSnapshotSchema.parse(pick("projects")),
    "home.json": homeSnapshotSchema.parse(pick("home")),
    "about.json": aboutSnapshotSchema.parse(pick("about")),
  };

  await mkdir(ORIGINALS, { recursive: true });
  let downloaded = 0;
  const seen = new Set<string>();
  for (const media of perLocale.flatMap((p) => p.media)) {
    const key = mediaKey(media.name);
    if (seen.has(key)) continue;
    seen.add(key);
    const ext = path.extname(media.url) || ".jpg";
    const target = path.join(ORIGINALS, `${key}${ext}`);
    if (existsSync(target)) continue;
    const res = await fetch(new URL(media.url, baseUrl));
    if (!res.ok) throw new Error(`Failed to download ${media.url}: ${res.status}`);
    await writeFile(target, Buffer.from(await res.arrayBuffer()));
    downloaded++;
  }

  for (const [name, data] of Object.entries(files)) {
    await writeFile(path.join(CONTENT, name), `${JSON.stringify(data, null, 2)}\n`);
  }
  const projectCount = perLocale[0]?.projects.length ?? 0;
  console.log(`snapshot: ${projectCount} projects × ${LOCALES.length} locales, ${seen.size} images (${downloaded} new)`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
