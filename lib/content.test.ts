import { readdirSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import projectsJson from "@/content/projects.json";
import {
  type ContentSource,
  createContentSource,
  createSnapshotSource,
  getFeaturedProjects,
  getNextProject,
  memoize,
} from "./content";
import { mediaKey, populate, splitParagraphs } from "./strapi";

const media = (name: string, width = 2400, height = 1600) => ({
  id: 1,
  documentId: "m1",
  name,
  url: `/uploads/${name.replace(/\W/g, "_")}_a1b2c3.jpg`,
  width,
  height,
  alternativeText: null,
  formats: {},
});

const strapiProject = {
  id: 7,
  documentId: "abc123",
  locale: "en",
  slug: "grove-house",
  title: "House by the Grove",
  location: "Sochi",
  year: 2023,
  area: 412,
  category: "residential",
  description: "First paragraph.\n\nSecond paragraph.\r\n  \r\nThird.",
  cover: { id: 1, alt: "Cover alt", image: media("Grove House Cover.JPG", 2400, 1969) },
  gallery: [{ id: 2, alt: "Canopy", image: media("grove-house-01.jpg", 1800, 2400) }],
  createdAt: "2026-01-01T00:00:00.000Z",
  publishedAt: "2026-01-01T00:00:00.000Z",
};

const strapiHome = {
  id: 1,
  documentId: "home",
  heroTitle: "Structure first.\nEverything else\n\nfollows.",
  heroImage: { id: 3, alt: "Hero", image: media("hero-grove-house.jpg", 2400, 1457) },
  manifesto: "  Manifesto.  ",
  stats: [{ id: 1, value: "14", label: "years" }],
  featuredProjects: [{ id: 7, documentId: "abc123", slug: "grove-house" }],
};

function fakeFetch(routes: Record<string, unknown>, status = 200) {
  return vi.fn(async (input: string | URL | Request) => {
    const url = new URL(input instanceof Request ? input.url : input);
    const body = routes[url.pathname];
    return new Response(JSON.stringify(body ?? { error: "not found" }), {
      status: body ? status : 404,
      headers: { "Content-Type": "application/json" },
    });
  });
}

describe("createContentSource", () => {
  it("falls back to the bundled JSON snapshot when STRAPI_URL is not set", async () => {
    const source = createContentSource({});
    expect(source.kind).toBe("snapshot");
    expect(await source.projects("ru")).toEqual(projectsJson.ru);
    expect((await source.home("en")).heroTitle.length).toBeGreaterThan(0);
  });

  it("treats a blank STRAPI_URL as unset", () => {
    expect(createContentSource({ STRAPI_URL: "   " }).kind).toBe("snapshot");
  });

  it("maps a Strapi v5 project collection into the domain shape", async () => {
    const fetchImpl = fakeFetch({ "/api/projects": { data: [strapiProject], meta: {} } });
    const source = createContentSource({ STRAPI_URL: "http://cms.test", STRAPI_TOKEN: "t0k" }, fetchImpl);

    expect(source.kind).toBe("strapi");
    expect(await source.projects("en")).toEqual([
      {
        slug: "grove-house",
        title: "House by the Grove",
        location: "Sochi",
        year: 2023,
        area: 412,
        category: "residential",
        cover: { key: "grove-house-cover", alt: "Cover alt", width: 2400, height: 1969 },
        gallery: [{ key: "grove-house-01", alt: "Canopy", width: 1800, height: 2400 }],
        description: ["First paragraph.", "Second paragraph.", "Third."],
      },
    ]);

    const [url, init] = fetchImpl.mock.calls[0]! as unknown as [URL, RequestInit];
    expect(url.searchParams.get("locale")).toBe("en");
    expect(url.searchParams.get("populate[cover][populate][image]")).toBe("true");
    expect(url.searchParams.get("sort[0]")).toBe("year:desc");
    expect(init.headers).toEqual({ Authorization: "Bearer t0k" });
  });

  it("treats a null gallery as empty", async () => {
    const fetchImpl = fakeFetch({ "/api/projects": { data: [{ ...strapiProject, gallery: null }] } });
    const [project] = await createContentSource({ STRAPI_URL: "http://cms.test" }, fetchImpl).projects("ru");
    expect(project?.gallery).toEqual([]);
  });

  it("maps the home single type, splitting the hero title into lines", async () => {
    const fetchImpl = fakeFetch({ "/api/home-page": { data: strapiHome } });
    const home = await createContentSource({ STRAPI_URL: "http://cms.test" }, fetchImpl).home("en");
    expect(home).toEqual({
      heroTitle: ["Structure first.", "Everything else", "follows."],
      heroImage: { key: "hero-grove-house", alt: "Hero", width: 2400, height: 1457 },
      manifesto: "Manifesto.",
      stats: [{ value: "14", label: "years" }],
      featured: ["grove-house"],
    });
  });

  it("fails loudly on a non-OK response instead of silently using the snapshot", async () => {
    const fetchImpl = fakeFetch({ "/api/projects": { error: {} } }, 500);
    await expect(createContentSource({ STRAPI_URL: "http://cms.test" }, fetchImpl).projects("ru")).rejects.toThrow(
      /Strapi 500/,
    );
  });

  it("rejects a response that does not match the content model", async () => {
    const broken = { ...strapiProject, category: "industrial" };
    const fetchImpl = fakeFetch({ "/api/projects": { data: [broken] } });
    await expect(createContentSource({ STRAPI_URL: "http://cms.test" }, fetchImpl).projects("ru")).rejects.toThrow(
      /Unexpected Strapi response/,
    );
  });
});

describe("createSnapshotSource", () => {
  it("rejects a malformed snapshot at creation time", () => {
    expect(() => createSnapshotSource({ projects: { ru: [{ slug: "x" }], en: [] }, home: {}, about: {} })).toThrow();
  });
});

describe("snapshot invariants", () => {
  const source = createSnapshotSource();

  it("has the same projects in the same order in both locales", async () => {
    const slugs = async (l: "ru" | "en") => (await source.projects(l)).map((p) => p.slug);
    // The language switcher maps /projects/<slug>/ across locales by slug.
    expect(await slugs("en")).toEqual(await slugs("ru"));
  });

  it("only references images that exist in media/originals", async () => {
    const [projects, home, about] = await Promise.all([source.projects("ru"), source.home("ru"), source.about("ru")]);
    const keys = [...projects.flatMap((p) => [p.cover, ...p.gallery]), home.heroImage, about.image].map((i) => i.key);
    const originals = new Set(readdirSync("media/originals").map((f) => f.replace(/.[a-z0-9]+$/i, "")));
    const missing = keys.filter((k) => !originals.has(k));
    expect(missing).toEqual([]);
  });

  it("features only projects that exist", async () => {
    expect((await getFeaturedProjects("en")).map((p) => p.slug)).toEqual((await source.home("en")).featured);
  });
});

describe("helpers", () => {
  it("wraps around to the first project after the last one", async () => {
    const last = projectsJson.ru.at(-1)!.slug;
    expect((await getNextProject("ru", last))?.slug).toBe(projectsJson.ru[0]!.slug);
    expect(await getNextProject("ru", "missing")).toBeUndefined();
  });

  it("memoizes each locale/method pair", async () => {
    const projects = vi.fn(async () => []);
    const inner: ContentSource = { kind: "strapi", projects, home: vi.fn(), about: vi.fn() };
    const cached = memoize(inner);
    await Promise.all([cached.projects("ru"), cached.projects("ru"), cached.projects("en")]);
    expect(projects).toHaveBeenCalledTimes(2);
  });

  it("derives stable media keys from upload file names", () => {
    expect(mediaKey("Grove House 01.JPG")).toBe("grove-house-01");
    expect(mediaKey("__hero__.webp")).toBe("hero");
  });

  it("splits paragraphs on blank lines only", () => {
    expect(splitParagraphs("a\nb\n\nc")).toEqual(["a\nb", "c"]);
  });

  it("builds Strapi bracket populate params", () => {
    expect(populate({ cover: { populate: { image: true } }, rel: { fields: ["slug"] }, stats: true })).toEqual({
      "populate[cover][populate][image]": "true",
      "populate[rel][fields][0]": "slug",
      "populate[stats]": "true",
    });
  });
});
