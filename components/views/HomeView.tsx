import Link from "next/link";
import { getFeaturedProjects, getHomePage, getProjects } from "@/lib/content";
import { getDictionary, projectCount } from "@/lib/i18n";
import { localePath, routes } from "@/lib/paths";
import type { Locale } from "@/lib/types";
import { Picture } from "../Picture";
import { ProjectCard } from "../ProjectCard";
import { SectionLabel } from "../SectionLabel";

export async function HomeView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [home, featured, projects] = await Promise.all([
    getHomePage(locale),
    getFeaturedProjects(locale),
    getProjects(locale),
  ]);
  const heroAspect = home.heroImage.width / home.heroImage.height;

  return (
    <>
      <section data-tone="dark" className="relative h-svh min-h-136 overflow-hidden bg-ink text-paper">
        <Picture
          image={home.heroImage}
          priority
          artDirected
          // In a viewport narrower than the photo's aspect, the frame is height-bound.
          sizes={`(max-aspect-ratio: ${home.heroImage.width}/${home.heroImage.height}) ${Math.ceil(heroAspect * 100)}vh, 100vw`}
          className="hero-image frame absolute inset-0"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink/55 to-transparent" />
        <div className="container-x absolute inset-x-0 bottom-0 pb-[max(2rem,env(safe-area-inset-bottom))] md:pb-12">
          <p className="caption hero-fade text-paper/75">
            {t.tagline} · {t.city} · {t.since}
          </p>
          <h1 className="display mt-5 text-[clamp(3.1rem,10.5vw,11rem)]">
            {home.heroTitle.map((line, i) => (
              <span key={line} className="hero-line" style={{ "--i": i } as React.CSSProperties}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <div className="caption hero-fade mt-8 flex items-center justify-between text-paper/75 md:mt-12">
            <span>{t.home.scroll} ↓</span>
            <span>{projectCount(projects.length, locale)}</span>
          </div>
        </div>
      </section>

      <section data-hscroll className="relative overflow-hidden py-24 md:flex md:h-svh md:flex-col md:justify-center md:py-0">
        <div className="container-x flex items-end justify-between gap-6">
          <div>
            <SectionLabel index="01">
              {featured.length} / {projects.length}
            </SectionLabel>
            <h2 className="display mt-4 text-[clamp(2.25rem,5vw,4.5rem)]">{t.home.featured}</h2>
          </div>
          <Link href={localePath(locale, routes.projects)} className="caption link-underline shrink-0 pb-2">
            {t.home.allProjects} →
          </Link>
        </div>
        <ul
          data-hscroll-track
          className="container-x mt-10 flex snap-x snap-mandatory gap-(--gutter) overflow-x-auto pb-4 scrollbar-none md:mt-14 [&::-webkit-scrollbar]:hidden"
        >
          {featured.map((project, i) => (
            <li key={project.slug} className="w-[78vw] shrink-0 snap-start md:w-[min(34vw,32rem)]">
              <ProjectCard
                project={project}
                locale={locale}
                index={i}
                aspect="aspect-4/5 md:aspect-5/6"
                sizes="(min-width: 768px) 34vw, 78vw"
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="container-x py-28 md:py-44">
        <SectionLabel index="02">{t.home.manifestoLabel}</SectionLabel>
        <p data-words className="mt-8 max-w-[24ch] text-[clamp(1.75rem,4.4vw,4.25rem)] leading-[1.08] tracking-[-0.03em] md:ml-[25%]">
          {home.manifesto.split(" ").map((word, i) => (
            <span key={i} className="word">
              {word}{" "}
            </span>
          ))}
        </p>
      </section>

      <section className="container-x pb-28 md:pb-44">
        <SectionLabel index="03">{t.home.statsLabel}</SectionLabel>
        <dl data-stagger className="mt-10 grid grid-cols-2 gap-x-(--gutter) gap-y-12 md:grid-cols-4">
          {home.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col border-t border-ink pt-4">
              <dt className="caption order-2 mt-3 text-ink-soft">{stat.label}</dt>
              <dd className="display -order-1 text-[clamp(2.5rem,6vw,6rem)] whitespace-nowrap tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
