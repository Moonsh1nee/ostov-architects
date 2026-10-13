import aboutJson from "@/content/about.json";
import homeJson from "@/content/home.json";
import projectsJson from "@/content/projects.json";
import { createStrapiClient } from "./strapi";
import {
  type AboutPage,
  type HomePage,
  type Locale,
  type Project,
  aboutSnapshotSchema,
  homeSnapshotSchema,
  projectsSnapshotSchema,
} from "./types";

export interface ContentSource {
  readonly kind: "strapi" | "snapshot";
  projects(locale: Locale): Promise<Project[]>;
  home(locale: Locale): Promise<HomePage>;
  about(locale: Locale): Promise<AboutPage>;
}

export interface Snapshot {
  projects: unknown;
  home: unknown;
  about: unknown;
}

const bundledSnapshot: Snapshot = { projects: projectsJson, home: homeJson, about: aboutJson };

export function createSnapshotSource(snapshot: Snapshot = bundledSnapshot): ContentSource {
  // Parsed eagerly: a malformed snapshot should fail the build, not render half a page.
  const projects = projectsSnapshotSchema.parse(snapshot.projects);
  const home = homeSnapshotSchema.parse(snapshot.home);
  const about = aboutSnapshotSchema.parse(snapshot.about);
  return {
    kind: "snapshot",
    projects: async (locale) => projects[locale],
    home: async (locale) => home[locale],
    about: async (locale) => about[locale],
  };
}

export type SourceEnv = Readonly<Record<string, string | undefined>>;

export function createContentSource(
  env: SourceEnv = process.env,
  fetchImpl: typeof fetch = fetch,
): ContentSource {
  const baseUrl = env.STRAPI_URL?.trim();
  if (!baseUrl) return createSnapshotSource();
  return { kind: "strapi", ...createStrapiClient({ baseUrl, token: env.STRAPI_TOKEN, fetchImpl }) };
}

/** Wraps a source so each (method, locale) pair is fetched once per build. */
export function memoize(source: ContentSource): ContentSource {
  const cache = new Map<string, Promise<unknown>>();
  const once = <T>(key: string, load: () => Promise<T>): Promise<T> => {
    if (!cache.has(key)) cache.set(key, load());
    return cache.get(key) as Promise<T>;
  };
  return {
    kind: source.kind,
    projects: (l) => once(`projects:${l}`, () => source.projects(l)),
    home: (l) => once(`home:${l}`, () => source.home(l)),
    about: (l) => once(`about:${l}`, () => source.about(l)),
  };
}

let source: ContentSource | undefined;
const getSource = () => (source ??= memoize(createContentSource()));

export const getProjects = (locale: Locale) => getSource().projects(locale);
export const getHomePage = (locale: Locale) => getSource().home(locale);
export const getAboutPage = (locale: Locale) => getSource().about(locale);

export async function getProject(locale: Locale, slug: string): Promise<Project | undefined> {
  return (await getProjects(locale)).find((p) => p.slug === slug);
}

/** The project after `slug`, wrapping around, for the "next project" link. */
export async function getNextProject(locale: Locale, slug: string): Promise<Project | undefined> {
  const projects = await getProjects(locale);
  const i = projects.findIndex((p) => p.slug === slug);
  return i === -1 || projects.length < 2 ? undefined : projects[(i + 1) % projects.length];
}

export async function getFeaturedProjects(locale: Locale): Promise<Project[]> {
  const [home, projects] = await Promise.all([getHomePage(locale), getProjects(locale)]);
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  return home.featured.flatMap((slug) => bySlug.get(slug) ?? []);
}
