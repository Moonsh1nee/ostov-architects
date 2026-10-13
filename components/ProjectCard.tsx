import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { localePath, routes } from "@/lib/paths";
import type { Locale, Project } from "@/lib/types";
import { Picture } from "./Picture";

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  index: number;
  sizes: string;
  /** Tailwind aspect class for the image frame. */
  aspect?: string;
  className?: string;
}

export function ProjectCard({ project, locale, index, sizes, aspect = "aspect-4/5", className }: ProjectCardProps) {
  const t = getDictionary(locale);
  return (
    <Link href={localePath(locale, routes.project(project.slug))} className={`group block ${className ?? ""}`}>
      <div className={`frame ${aspect}`} data-reveal="clip">
        <Picture
          image={project.cover}
          sizes={sizes}
          imgClassName="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-3">
        <h3 className="text-[clamp(1.25rem,2vw,1.625rem)] leading-tight tracking-[-0.02em]">
          <span className="caption mr-3 align-middle text-ink-soft">{String(index + 1).padStart(2, "0")}</span>
          {project.title}
        </h3>
        <span className="caption shrink-0 text-ink-soft">{project.year}</span>
      </div>
      <p className="caption mt-1.5 text-ink-soft">
        {t.categorySingular[project.category]} · {project.location}
      </p>
    </Link>
  );
}
