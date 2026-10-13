import { type Locale, DEFAULT_LOCALE } from "./types";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3004").replace(/\/$/, "");

export const routes = {
  home: "/",
  projects: "/projects/",
  project: (slug: string) => `/projects/${slug}/`,
  about: "/about/",
  contacts: "/contacts/",
} as const;

/** Locale-prefixed app path ("/" for RU, "/en/" for EN). Next adds basePath for <Link>. */
export function localePath(locale: Locale, path: string): string {
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

/** Splits an app path (without basePath) into locale and the locale-neutral path. */
export function parseLocalePath(pathname: string): { locale: Locale; path: string } {
  const match = /^\/en(\/.*)?$/.exec(pathname);
  if (match) return { locale: "en", path: withTrailingSlash(match[1] ?? "/") };
  return { locale: DEFAULT_LOCALE, path: withTrailingSlash(pathname || "/") };
}

function withTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

/** Absolute URL for metadata, sitemap and Open Graph. */
export function absoluteUrl(appPath: string): string {
  return `${SITE_URL}${appPath}`;
}

/** URL for files in /public, which plain <img> and <a> do not prefix with basePath. */
export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
