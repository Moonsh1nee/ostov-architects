import { getAboutPage } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { AbstractPortrait } from "../AbstractPortrait";
import { PageHeader } from "../PageHeader";
import { Picture } from "../Picture";
import { SectionLabel } from "../SectionLabel";

const pad = (n: number) => String(n).padStart(2, "0");

export async function AboutView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const about = await getAboutPage(locale);

  return (
    <div className="container-x">
      <PageHeader title={t.about.title} />

      <section className="grid gap-10 pb-28 md:grid-cols-12 md:pb-44">
        <p data-reveal="fade" className="text-[clamp(1.5rem,3.2vw,3rem)] leading-[1.12] tracking-[-0.03em] md:col-span-7">
          {about.intro}
        </p>
        <div className="frame aspect-4/5 md:col-span-4 md:col-start-9" data-reveal="clip">
          <Picture
            image={about.image}
            sizes="(min-width: 768px) 30vw, 100vw"
            priority
            imgProps={{ "data-parallax": "0.1" }}
          />
        </div>
      </section>

      <section className="pb-28 md:pb-44">
        <SectionLabel index="01">{t.about.approach}</SectionLabel>
        <ol data-stagger className="mt-10 grid gap-x-(--gutter) gap-y-12 md:grid-cols-3">
          {about.approach.map((item, i) => (
            <li key={item.title} className="border-t border-ink pt-5">
              <span className="caption text-accent">{pad(i + 1)}</span>
              <h2 className="mt-6 text-[clamp(1.5rem,2.4vw,2.25rem)] leading-tight tracking-[-0.025em]">{item.title}</h2>
              <p className="mt-4 max-w-[38ch] leading-relaxed text-ink-soft">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pb-28 md:pb-44">
        <SectionLabel index="02">{t.about.team}</SectionLabel>
        <ul data-stagger className="mt-10 grid grid-cols-2 gap-x-(--gutter) gap-y-12 md:grid-cols-3 lg:grid-cols-6">
          {about.team.map((person) => (
            <li key={person.name}>
              <AbstractPortrait name={person.name} className="aspect-4/5 w-full" />
              <p className="mt-4 leading-tight">{person.name}</p>
              <p className="caption mt-1.5 text-ink-soft">{person.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="pb-32 md:pb-48">
        <SectionLabel index="03">{t.about.stages}</SectionLabel>
        <ol className="mt-10">
          {about.stages.map((stage, i) => (
            <li
              key={stage.title}
              data-reveal="fade"
              className="grid gap-3 border-t border-line py-8 md:grid-cols-12 md:gap-(--gutter) md:py-10"
            >
              <span className="caption text-ink-soft md:col-span-2">
                {t.about.stage} {pad(i + 1)}
              </span>
              <h3 className="text-[clamp(1.5rem,3vw,2.75rem)] leading-tight tracking-[-0.03em] md:col-span-5">
                {stage.title}
              </h3>
              <p className="max-w-[44ch] leading-relaxed text-ink-soft md:col-span-5">{stage.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
