/**
 * Seeds an empty CMS from the same JSON snapshot the static site builds from
 * (../content/*.json) and the originals in ../media/originals, so a fresh
 * `docker compose up` shows the real site content instead of an empty admin.
 */
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import type { Core } from '@strapi/strapi';

type Locale = 'ru' | 'en';
const LOCALES: Locale[] = ['ru', 'en'];

interface SnapshotImage {
  key: string;
  alt: string;
}
interface SnapshotProject {
  slug: string;
  title: string;
  location: string;
  year: number;
  area: number;
  category: string;
  cover: SnapshotImage;
  gallery: SnapshotImage[];
  description: string[];
}
interface SnapshotHome {
  heroTitle: string[];
  heroImage: SnapshotImage;
  manifesto: string;
  stats: { value: string; label: string }[];
  featured: string[];
}
interface SnapshotAbout {
  intro: string;
  image: SnapshotImage;
  approach: { title: string; text: string }[];
  team: { name: string; role: string }[];
  stages: { title: string; text: string }[];
}
type ByLocale<T> = Record<Locale, T>;

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

async function readJson<T>(dir: string, file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(dir, file), 'utf8')) as T;
}

async function findOriginal(mediaDir: string, key: string) {
  for (const ext of Object.keys(MIME)) {
    const filepath = path.join(mediaDir, `${key}${ext}`);
    try {
      return { ext, filepath, size: (await stat(filepath)).size };
    } catch {
      // try the next extension
    }
  }
  throw new Error(`[seed] no original for image "${key}" in ${mediaDir}`);
}

/** Uploads each original once and maps image key -> upload id. */
function createUploader(strapi: Core.Strapi, mediaDir: string) {
  const ids = new Map<string, number>();
  return async (key: string): Promise<number> => {
    const known = ids.get(key);
    if (known) return known;
    const { ext, filepath, size } = await findOriginal(mediaDir, key);
    const [file] = await strapi
      .plugin('upload')
      .service('upload')
      .upload({
        // The upload `name` becomes the image key on the site (see mediaKey in lib/strapi.ts).
        data: { fileInfo: { name: `${key}${ext}` } },
        files: { filepath, originalFilename: `${key}${ext}`, mimetype: MIME[ext], size },
      });
    ids.set(key, file.id);
    return file.id;
  };
}

export async function seedFromSnapshot(strapi: Core.Strapi): Promise<void> {
  const projectsApi = strapi.documents('api::project.project');
  if ((await projectsApi.count({})) > 0) return;

  const root = path.resolve(process.cwd(), '..');
  const contentDir = process.env.SNAPSHOT_DIR ?? path.join(root, 'content');
  const mediaDir = process.env.MEDIA_DIR ?? path.join(root, 'media', 'originals');
  strapi.log.info(`[seed] empty database: importing ${contentDir} and ${mediaDir}`);

  const [projects, home, about] = await Promise.all([
    readJson<ByLocale<SnapshotProject[]>>(contentDir, 'projects.json'),
    readJson<ByLocale<SnapshotHome>>(contentDir, 'home.json'),
    readJson<ByLocale<SnapshotAbout>>(contentDir, 'about.json'),
  ]);
  const upload = createUploader(strapi, mediaDir);
  const figure = async (img: SnapshotImage) => ({ image: await upload(img.key), alt: img.alt });

  // Projects: create in the default locale, then add the other localization to the same document.
  const documentIdBySlug = new Map<string, string>();
  for (const ru of projects.ru) {
    let documentId: string | undefined;
    for (const locale of LOCALES) {
      const p = projects[locale].find((x) => x.slug === ru.slug);
      if (!p) throw new Error(`[seed] project ${ru.slug} has no ${locale} version`);
      const data = {
        title: p.title,
        slug: p.slug,
        location: p.location,
        year: p.year,
        area: p.area,
        category: p.category as 'residential' | 'public' | 'interior',
        description: p.description.join('\n\n'),
        cover: await figure(p.cover),
        gallery: await Promise.all(p.gallery.map(figure)),
      };
      const doc = documentId
        ? await projectsApi.update({ documentId, locale, data })
        : await projectsApi.create({ locale, data });
      if (!doc) throw new Error(`[seed] failed to save project ${p.slug} (${locale})`);
      documentId = doc.documentId;
    }
    await projectsApi.publish({ documentId: documentId!, locale: '*' });
    documentIdBySlug.set(ru.slug, documentId!);
  }

  const homeApi = strapi.documents('api::home-page.home-page');
  let homeId: string | undefined;
  for (const locale of LOCALES) {
    const h = home[locale];
    const data = {
      heroTitle: h.heroTitle.join('\n'),
      heroImage: await figure(h.heroImage),
      manifesto: h.manifesto,
      stats: h.stats,
      featuredProjects: h.featured.map((slug) => {
        const id = documentIdBySlug.get(slug);
        if (!id) throw new Error(`[seed] featured project ${slug} does not exist`);
        return id;
      }),
    };
    const doc = homeId ? await homeApi.update({ documentId: homeId, locale, data }) : await homeApi.create({ locale, data });
    if (!doc) throw new Error(`[seed] failed to save home page (${locale})`);
    homeId = doc.documentId;
  }
  await homeApi.publish({ documentId: homeId!, locale: '*' });

  const aboutApi = strapi.documents('api::about-page.about-page');
  let aboutId: string | undefined;
  for (const locale of LOCALES) {
    const a = about[locale];
    const data = {
      intro: a.intro,
      image: await figure(a.image),
      approach: a.approach,
      team: a.team,
      stages: a.stages,
    };
    const doc = aboutId ? await aboutApi.update({ documentId: aboutId, locale, data }) : await aboutApi.create({ locale, data });
    if (!doc) throw new Error(`[seed] failed to save about page (${locale})`);
    aboutId = doc.documentId;
  }
  await aboutApi.publish({ documentId: aboutId!, locale: '*' });

  strapi.log.info(`[seed] imported ${documentIdBySlug.size} projects, home and about pages in ${LOCALES.join(', ')}`);
}
