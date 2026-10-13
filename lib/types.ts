import { z } from "zod";

export const LOCALES = ["ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";

export const CATEGORIES = ["residential", "public", "interior"] as const;
export type Category = (typeof CATEGORIES)[number];

// `key` names a file in media/originals; the image pipeline derives every
// responsive variant from it, so content never stores URLs.
export const imageSchema = z.object({
  key: z.string().regex(/^[a-z0-9-]+$/),
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type ImageAsset = z.infer<typeof imageSchema>;

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  location: z.string().min(1),
  year: z.number().int(),
  area: z.number().positive(),
  category: z.enum(CATEGORIES),
  cover: imageSchema,
  gallery: z.array(imageSchema),
  description: z.array(z.string().min(1)).min(1),
});
export type Project = z.infer<typeof projectSchema>;

const titledTextSchema = z.object({ title: z.string().min(1), text: z.string().min(1) });
export type TitledText = z.infer<typeof titledTextSchema>;

export const homePageSchema = z.object({
  heroTitle: z.array(z.string().min(1)).min(1),
  heroImage: imageSchema,
  manifesto: z.string().min(1),
  stats: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })),
  featured: z.array(z.string()),
});
export type HomePage = z.infer<typeof homePageSchema>;

export const aboutPageSchema = z.object({
  intro: z.string().min(1),
  image: imageSchema,
  approach: z.array(titledTextSchema),
  team: z.array(z.object({ name: z.string().min(1), role: z.string().min(1) })),
  stages: z.array(titledTextSchema),
});
export type AboutPage = z.infer<typeof aboutPageSchema>;

const byLocale = <T extends z.ZodType>(schema: T) => z.object({ ru: schema, en: schema });

export const projectsSnapshotSchema = byLocale(z.array(projectSchema));
export const homeSnapshotSchema = byLocale(homePageSchema);
export const aboutSnapshotSchema = byLocale(aboutPageSchema);
