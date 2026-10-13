import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { absoluteUrl, localePath, routes } from "@/lib/paths";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/types";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects(DEFAULT_LOCALE);
  const paths = [
    routes.home,
    routes.projects,
    ...projects.map((p) => routes.project(p.slug)),
    routes.about,
    routes.contacts,
  ];
  return paths.flatMap((path) => {
    const languages = Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(localePath(l, path))]));
    return LOCALES.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      changeFrequency: "monthly" as const,
      priority: path === routes.home ? 1 : 0.7,
      alternates: { languages },
    }));
  });
}
