"use client";

import { useState } from "react";
import { getDictionary } from "@/lib/i18n";
import { type Category, type Locale, type Project, CATEGORIES } from "@/lib/types";
import { notifyContentChanged } from "./motion/events";
import { ProjectCard } from "./ProjectCard";

type Filter = Category | "all";

// Client-side because the asymmetric layout depends on each card's position
// among the *visible* ones, which CSS alone cannot know after filtering.
export function ProjectsExplorer({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const t = getDictionary(locale);
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const count = (f: Filter) => (f === "all" ? projects.length : projects.filter((p) => p.category === f).length);

  const select = (f: Filter) => {
    setFilter(f);
    // Let the motion layer re-bind reveals and recompute scroll positions after React commits.
    requestAnimationFrame(notifyContentChanged);
  };

  return (
    <>
      <div role="group" aria-label={t.projects.filterLabel} className="flex flex-wrap gap-x-6 gap-y-3 border-y border-line py-4">
        {(["all", ...CATEGORIES] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => select(f)}
            className="group flex items-baseline gap-1.5 py-1 text-sm text-ink-soft transition-colors hover:text-ink aria-pressed:text-ink"
          >
            <span className="link-underline group-aria-pressed:bg-[length:100%_1px]">
              {f === "all" ? t.all : t.categories[f]}
            </span>
            <sup className="caption text-[0.625rem]">{count(f)}</sup>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-24 text-ink-soft">{t.projects.empty}</p>
      ) : (
        <ul className="mt-12 grid grid-cols-1 gap-x-(--gutter) gap-y-16 md:mt-20 md:grid-cols-12 md:gap-y-28">
          {visible.map((project, i) => {
            const wide = i % 2 === 0;
            return (
              <li
                key={project.slug}
                className={wide ? "md:col-span-7" : "md:col-span-4 md:col-start-9 md:mt-[45%]"}
              >
                <ProjectCard
                  project={project}
                  locale={locale}
                  index={projects.indexOf(project)}
                  headingLevel="h2"
                  priority={i === 0}
                  aspect={wide ? "aspect-4/5 md:aspect-6/5" : "aspect-4/5"}
                  sizes={wide ? "(min-width: 768px) 56vw, 100vw" : "(min-width: 768px) 32vw, 100vw"}
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
