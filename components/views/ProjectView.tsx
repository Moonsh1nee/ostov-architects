import Link from "next/link";
import { notFound } from "next/navigation";
import { getNextProject, getProject } from "@/lib/content";
import { formatArea, getDictionary } from "@/lib/i18n";
import { localePath, routes } from "@/lib/paths";
import type { ImageAsset, Locale } from "@/lib/types";
import { Picture } from "../Picture";

// Gallery rhythm: wide, then a pair, repeating — so long galleries never read as a plain stack.
const galleryLayout = (i: number) =>
  i % 3 === 0 ? "md:col-span-12" : i % 3 === 1 ? "md:col-span-5" : "md:col-span-6 md:col-start-7 md:mt-[30%]";

const frameAspect = (image: ImageAsset, wide: boolean) =>
  wide ? "aspect-4/5 md:aspect-16/9" : image.height > image.width ? "aspect-4/5" : "aspect-3/2";

export async function ProjectView({ locale, slug }: { locale: Locale; slug: string }) {
  const t = getDictionary(locale);
  const [project, next] = await Promise.all([getProject(locale, slug), getNextProject(locale, slug)]);
  if (!project) notFound();
  const [lead, ...body] = project.description;

  const specs = [
    { label: t.project.specs.location, value: project.location },
    { label: t.project.specs.year, value: String(project.year) },
    { label: t.project.specs.area, value: `${formatArea(project.area, locale)} ${t.project.sqm}` },
    { label: t.project.specs.category, value: t.categorySingular[project.category] },
  ];

  return (
    <article>
      <header className="container-x pt-[calc(var(--header-h)+3rem)] pb-10 md:pt-[calc(var(--header-h)+6rem)] md:pb-14">
        <Link href={localePath(locale, routes.projects)} className="caption link-underline text-ink-soft">
          ← {t.project.back}
        </Link>
        <h1 className="display mt-6 max-w-[14ch] text-[clamp(3rem,9vw,9.5rem)]">
          <span className="hero-line">
            <span>{project.title}</span>
          </span>
        </h1>
      </header>

      <div className="frame aspect-4/5 md:aspect-16/8">
        <Picture
          image={project.cover}
          priority
          artDirected
          sizes="100vw"
          className="hero-image"
        />
      </div>

      <section className="container-x grid gap-12 py-16 md:grid-cols-12 md:py-28">
        <dl data-stagger className="grid grid-cols-2 gap-x-6 gap-y-6 self-start md:col-span-4 md:grid-cols-1">
          {specs.map((spec) => (
            <div key={spec.label} className="flex flex-col border-t border-line pt-3">
              <dt className="caption text-ink-soft">{spec.label}</dt>
              <dd className="mt-1.5 text-lg">{spec.value}</dd>
            </div>
          ))}
        </dl>
        <div className="md:col-span-7 md:col-start-6">
          <p data-reveal="fade" className="text-[clamp(1.375rem,2.4vw,2.125rem)] leading-[1.2] tracking-[-0.02em]">
            {lead}
          </p>
          {body.map((paragraph) => (
            <p key={paragraph} data-reveal="fade" className="mt-6 max-w-[60ch] text-lg leading-relaxed text-ink-soft">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {project.gallery.length > 0 && (
        <section aria-label={t.project.gallery} className="container-x pb-24 md:pb-40">
          <ul className="grid grid-cols-1 gap-x-(--gutter) gap-y-6 md:grid-cols-12 md:gap-y-24">
            {project.gallery.map((image, i) => {
              const wide = i % 3 === 0;
              return (
                <li key={image.key} className={galleryLayout(i)}>
                  <div className={`frame ${frameAspect(image, wide)}`} data-reveal="clip">
                    <Picture
                      image={image}
                      sizes={wide ? "(min-width: 768px) 95vw, 100vw" : "(min-width: 768px) 45vw, 100vw"}
                      imgProps={{ "data-parallax": "0.1" }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {next && (
        <Link
          href={localePath(locale, routes.project(next.slug))}
          data-tone="dark"
          className="group relative block overflow-hidden bg-ink text-paper"
        >
          <div className="frame aspect-4/5 opacity-60 transition-opacity duration-700 group-hover:opacity-80 md:aspect-16/7">
            <Picture image={next.cover} sizes="100vw" imgProps={{ "data-parallax": "0.15" }} />
          </div>
          <div className="container-x absolute inset-0 flex flex-col justify-end pb-10 md:pb-16">
            <span className="caption text-paper/75">{t.project.next} →</span>
            <span className="display mt-4 text-[clamp(2.5rem,8vw,8rem)]">{next.title}</span>
          </div>
        </Link>
      )}
    </article>
  );
}
