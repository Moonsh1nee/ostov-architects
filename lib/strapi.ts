import { z } from "zod";
import {
  type AboutPage,
  type HomePage,
  type ImageAsset,
  type Locale,
  type Project,
  CATEGORIES,
  aboutPageSchema,
  homePageSchema,
  projectSchema,
} from "./types";

// Strapi v5 REST returns flattened documents (no `attributes` wrapper).
const mediaSchema = z.object({
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
});
export type StrapiMedia = z.infer<typeof mediaSchema>;

// A figure is a component (image + localized alt), because Strapi's own
// `alternativeText` lives on the shared upload and cannot differ per locale.
const figureSchema = z.object({ image: mediaSchema, alt: z.string() });

const projectEntrySchema = z.object({
  slug: z.string(),
  title: z.string(),
  location: z.string(),
  year: z.number(),
  area: z.number(),
  category: z.enum(CATEGORIES),
  description: z.string(),
  cover: figureSchema,
  gallery: z.array(figureSchema).nullable(),
});
export type StrapiProject = z.infer<typeof projectEntrySchema>;

const homeEntrySchema = z.object({
  heroTitle: z.string(),
  heroImage: figureSchema,
  manifesto: z.string(),
  stats: z.array(z.object({ value: z.string(), label: z.string() })),
  featuredProjects: z.array(z.object({ slug: z.string() })),
});

const titledTextSchema = z.object({ title: z.string(), text: z.string() });
const aboutEntrySchema = z.object({
  intro: z.string(),
  image: figureSchema,
  approach: z.array(titledTextSchema),
  team: z.array(z.object({ name: z.string(), role: z.string() })),
  stages: z.array(titledTextSchema),
});

const collectionResponse = <T extends z.ZodType>(entry: T) => z.object({ data: z.array(entry) });
const singleResponse = <T extends z.ZodType>(entry: T) => z.object({ data: entry });

/** "Grove House 01.JPG" -> "grove-house-01": the key the image pipeline uses. */
export function mediaKey(fileName: string): string {
  return fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapFigure(figure: z.infer<typeof figureSchema>): ImageAsset {
  return {
    key: mediaKey(figure.image.name),
    alt: figure.alt,
    width: figure.image.width,
    height: figure.image.height,
  };
}

/** Long text fields are plain text with blank-line separated paragraphs. */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function mapProject(entry: StrapiProject): Project {
  return projectSchema.parse({
    slug: entry.slug,
    title: entry.title,
    location: entry.location,
    year: entry.year,
    area: entry.area,
    category: entry.category,
    cover: mapFigure(entry.cover),
    gallery: (entry.gallery ?? []).map(mapFigure),
    description: splitParagraphs(entry.description),
  });
}

export function mapHomePage(entry: z.infer<typeof homeEntrySchema>): HomePage {
  return homePageSchema.parse({
    heroTitle: entry.heroTitle.split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
    heroImage: mapFigure(entry.heroImage),
    manifesto: entry.manifesto.trim(),
    stats: entry.stats.map(({ value, label }) => ({ value, label })),
    featured: entry.featuredProjects.map((p) => p.slug),
  });
}

export function mapAboutPage(entry: z.infer<typeof aboutEntrySchema>): AboutPage {
  return aboutPageSchema.parse({
    intro: entry.intro.trim(),
    image: mapFigure(entry.image),
    approach: entry.approach.map(({ title, text }) => ({ title, text })),
    team: entry.team.map(({ name, role }) => ({ name, role })),
    stages: entry.stages.map(({ title, text }) => ({ title, text })),
  });
}

const FIGURE = { populate: { image: true } } as const;

export const strapiQueries = {
  projects: {
    path: "/api/projects",
    params: { "sort[0]": "year:desc", "sort[1]": "slug:asc", "pagination[pageSize]": "100", ...populate({ cover: FIGURE, gallery: FIGURE }) },
  },
  home: {
    path: "/api/home-page",
    params: populate({ heroImage: FIGURE, stats: true, featuredProjects: { fields: ["slug"] } }),
  },
  about: {
    path: "/api/about-page",
    params: populate({ image: FIGURE, approach: true, team: true, stages: true }),
  },
} as const;

type PopulateTree = { [field: string]: true | { populate?: PopulateTree; fields?: readonly string[] } };

/** Flattens a nested populate tree into Strapi's bracket query syntax. */
export function populate(tree: PopulateTree, prefix = "populate"): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [field, value] of Object.entries(tree)) {
    const base = `${prefix}[${field}]`;
    if (value === true) {
      out[base] = "true";
      continue;
    }
    value.fields?.forEach((f, i) => (out[`${base}[fields][${i}]`] = f));
    if (value.populate) Object.assign(out, populate(value.populate, `${base}[populate]`));
    if (!value.fields && !value.populate) out[base] = "true";
  }
  return out;
}

export interface StrapiClientOptions {
  baseUrl: string;
  token?: string;
  fetchImpl?: typeof fetch;
}

export function createStrapiClient({ baseUrl, token, fetchImpl = fetch }: StrapiClientOptions) {
  async function get<T extends z.ZodType>(
    path: string,
    params: Record<string, string>,
    locale: Locale,
    schema: T,
  ): Promise<z.infer<T>> {
    const url = new URL(path, baseUrl);
    for (const [k, v] of Object.entries({ ...params, locale })) url.searchParams.set(k, v);
    const res = await fetchImpl(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error(`Strapi ${res.status} ${res.statusText} for ${url.pathname}?locale=${locale}`);
    const parsed = schema.safeParse(await res.json());
    if (!parsed.success) {
      throw new Error(`Unexpected Strapi response for ${url.pathname}: ${z.prettifyError(parsed.error)}`);
    }
    return parsed.data;
  }

  return {
    async projects(locale: Locale): Promise<Project[]> {
      const { path, params } = strapiQueries.projects;
      const { data } = await get(path, params, locale, collectionResponse(projectEntrySchema));
      return data.map(mapProject);
    },
    async home(locale: Locale): Promise<HomePage> {
      const { path, params } = strapiQueries.home;
      return mapHomePage((await get(path, params, locale, singleResponse(homeEntrySchema))).data);
    },
    async about(locale: Locale): Promise<AboutPage> {
      const { path, params } = strapiQueries.about;
      return mapAboutPage((await get(path, params, locale, singleResponse(aboutEntrySchema))).data);
    },
    /** Media referenced by projects and pages, for the snapshot script to download. */
    async media(locale: Locale): Promise<StrapiMedia[]> {
      const [projects, home, about] = await Promise.all([
        get(strapiQueries.projects.path, strapiQueries.projects.params, locale, collectionResponse(projectEntrySchema)),
        get(strapiQueries.home.path, strapiQueries.home.params, locale, singleResponse(homeEntrySchema)),
        get(strapiQueries.about.path, strapiQueries.about.params, locale, singleResponse(aboutEntrySchema)),
      ]);
      return [
        ...projects.data.flatMap((p) => [p.cover.image, ...(p.gallery ?? []).map((g) => g.image)]),
        home.data.heroImage.image,
        about.data.image.image,
      ];
    },
  };
}

export type StrapiClient = ReturnType<typeof createStrapiClient>;
