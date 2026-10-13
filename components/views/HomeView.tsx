import Link from "next/link";
import { getAboutPage, getFeaturedProjects, getHomePage } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { localePath, routes } from "@/lib/paths";
import type { ImageAsset, Locale, Project } from "@/lib/types";
import { Intro } from "../home/Intro";
import { Picture } from "../Picture";
import { SectionLabel } from "../SectionLabel";

const HERO_SLIDES = 3;
const pad = (n: number) => String(n).padStart(2, "0");

export async function HomeView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [home, about, featured] = await Promise.all([
    getHomePage(locale),
    getAboutPage(locale),
    getFeaturedProjects(locale),
  ]);
  // The hero cycles through the first featured projects; the first slide uses
  // the dedicated hero shot, the others their covers.
  const slides: { image: ImageAsset; project: Project }[] = featured
    .slice(0, HERO_SLIDES)
    .map((project, i) => ({ project, image: i === 0 ? home.heroImage : project.cover }));
  const style = (i: number) => ({ "--i": i }) as React.CSSProperties;

  return (
    <>
      <section data-tone="dark" className="relative h-svh min-h-136 overflow-hidden bg-ink text-paper">
        {slides.map(({ image }, i) => (
          <div key={image.key} className="slide absolute inset-0" style={style(i)} aria-hidden={i > 0}>
            <Picture
              image={image}
              priority={i === 0}
              artDirected
              // A frame narrower than the photo's aspect is height-bound.
              sizes={`(max-aspect-ratio: ${image.width}/${image.height}) ${Math.ceil((image.width / image.height) * 100)}vh, 100vw`}
              className="frame absolute inset-0"
            />
          </div>
        ))}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink/50 to-transparent" />

        <div className="hero-fade container-x absolute inset-x-0 bottom-0 grid pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-10">
          {slides.map(({ project }, i) => (
            <div
              key={project.slug}
              className="slide-label col-start-1 row-start-1 flex items-end justify-between gap-4"
              style={style(i)}
            >
              <p className="flex flex-col gap-1 md:flex-row md:gap-16">
                <span className="statement text-sm md:text-base">{project.title}</span>
                <span className="caption text-paper/75">{project.location}</span>
              </p>
              <Link href={localePath(locale, routes.project(project.slug))} className="pill pill-light shrink-0">
                {t.home.viewProject}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x flex min-h-svh flex-col items-center justify-center py-28 text-center">
        <h1 data-words className="display text-[clamp(2.6rem,7.6vw,8.75rem)]">
          {home.heroTitle.map((line) => (
            <span key={line} className="block">
              {line.split(" ").map((word, i) => (
                <span key={i} className="word">
                  {word}{" "}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className="caption mt-10 text-ink-soft">
          {t.tagline} · {t.city} · {t.since}
        </p>
      </section>

      {/* GSAP pins the inner div: its pin-spacer must live inside a node React owns. */}
      <section data-expand className="relative">
        <div data-expand-pin className="relative md:h-svh md:overflow-hidden">
          <div data-expand-media className="frame aspect-4/5 md:absolute md:inset-0 md:aspect-auto">
            <Picture image={about.image} sizes="100vw" />
          </div>
          <div
            data-expand-panel
            className="relative bg-paper px-(--gutter) py-16 md:absolute md:inset-y-0 md:right-0 md:flex md:w-[58%] md:flex-col md:justify-center md:px-12 lg:px-20"
          >
            <p className="statement text-[clamp(1.5rem,2.5vw,2.6rem)]">{home.manifesto}</p>
            <div className="mt-10 md:ml-[30%]">
              <p className="max-w-[42ch] leading-relaxed text-ink-soft">{about.intro}</p>
              <Link href={localePath(locale, routes.about)} className="pill mt-6">
                {t.home.aboutLink}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={t.home.featured} className="relative">
        {featured.map((project, i) => (
          <article
            key={project.slug}
            data-tone="dark"
            className="sticky top-0 h-svh min-h-136 overflow-hidden bg-ink text-paper"
          >
            <Picture image={project.cover} artDirected sizes="100vw" className="frame absolute inset-0" />
            <div aria-hidden="true" className="absolute inset-0 bg-ink/35" />
            <div className="container-x relative flex h-full flex-col items-center justify-center text-center">
              <p className="caption text-paper/80">
                {project.location} · {project.year}
              </p>
              <h2 className="display mt-5 text-[clamp(2.5rem,8vw,8.5rem)]">{project.title}</h2>
              <Link href={localePath(locale, routes.project(project.slug))} className="pill pill-light mt-8">
                {t.home.viewProject}
              </Link>
            </div>
            <span className="caption absolute bottom-6 left-(--gutter) text-paper/70">
              {pad(i + 1)} / {pad(featured.length)}
            </span>
          </article>
        ))}
      </section>

      <div className="container-x flex justify-center py-20 md:py-28">
        <Link href={localePath(locale, routes.projects)} className="pill pill-dark">
          {t.home.allProjects}
        </Link>
      </div>

      <section className="container-x pb-28 md:pb-40">
        <SectionLabel index="01">{t.home.statsLabel}</SectionLabel>
        <dl data-stagger className="mt-10 grid grid-cols-2 gap-x-(--gutter) gap-y-12 md:grid-cols-4">
          {home.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col border-t border-ink pt-4">
              <dt className="caption order-2 mt-3 text-ink-soft">{stat.label}</dt>
              <dd className="display -order-1 text-[clamp(2.25rem,4.6vw,5rem)] whitespace-nowrap tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <Intro t={t} />
    </>
  );
}
