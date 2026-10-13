/**
 * Works around a Next 16.4 static-export bug on Windows: segment prefetch
 * files are meant to be flat (`__next.<seg>.__PAGE__.txt`), but the exporter
 * only replaces "/" in the collected paths, so Windows "\" separators turn
 * them into nested directories (`__next.<seg>/__PAGE__.txt`) and the client
 * prefetcher 404s. On Linux (CI) nothing matches and this is a no-op.
 */
import { readdir, rename, rm } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve(import.meta.dirname, "..", "out");

async function flatten(dir: string, prefix: string, target: string): Promise<number> {
  let moved = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = `${prefix}.${entry.name}`;
    const from = path.join(dir, entry.name);
    if (entry.isDirectory()) moved += await flatten(from, name, target);
    else {
      await rename(from, path.join(target, name));
      moved++;
    }
  }
  return moved;
}

async function walk(dir: string): Promise<number> {
  let moved = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      moved += await flatten(full, entry.name, dir);
      await rm(full, { recursive: true });
    } else if (entry.name !== "_next") {
      moved += await walk(full);
    }
  }
  return moved;
}

walk(OUT)
  .then((moved) => moved && console.log(`fix-export-segments: flattened ${moved} segment files`))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
