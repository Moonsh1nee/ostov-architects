import type { Metadata } from "next";
import { getDictionary } from "./i18n";
import { ogFile, OG_SIZE } from "./images";
import { SITE_URL, absoluteUrl, localePath } from "./paths";
import { type ImageAsset, type Locale, DEFAULT_LOCALE, LOCALES } from "./types";

interface PageMeta {
  locale: Locale;
  /** Locale-neutral app path, e.g. "/projects/". */
  path: string;
  /** Page title without the brand; omit for the home page. */
  title?: string;
  description: string;
  image: ImageAsset;
}

export function pageMetadata({ locale, path, title, description, image }: PageMeta): Metadata {
  const t = getDictionary(locale);
  const fullTitle = title ? `${title} — ${t.brand}` : t.meta.homeTitle;
  const languages = Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(localePath(l, path))]));
  return {
    metadataBase: new URL(`${SITE_URL}/`),
    title: fullTitle,
    description,
    alternates: {
      canonical: absoluteUrl(localePath(locale, path)),
      languages: { ...languages, "x-default": absoluteUrl(localePath(DEFAULT_LOCALE, path)) },
    },
    openGraph: {
      type: "website",
      siteName: t.brand,
      title: fullTitle,
      description,
      url: absoluteUrl(localePath(locale, path)),
      locale: t.meta.ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => getDictionary(l).meta.ogLocale),
      images: [{ url: absoluteUrl(`/${ogFile(image.key)}`), ...OG_SIZE, alt: image.alt }],
    },
    twitter: { card: "summary_large_image" },
  };
}
