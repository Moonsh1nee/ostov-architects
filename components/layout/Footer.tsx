import Link from "next/link";
import { getProjects } from "@/lib/content";
import { contact, getDictionary, projectCount } from "@/lib/i18n";
import { localePath, routes } from "@/lib/paths";
import type { Locale, Project } from "@/lib/types";

/** One row per city, linked to the latest project built there. */
function geography(projects: Project[]) {
  const byCity = new Map<string, Project>();
  for (const project of projects) {
    const city = project.location.split(",")[0]!.trim();
    if (!byCity.has(city)) byCity.set(city, project);
  }
  return [...byCity].map(([city, project]) => ({ city, project }));
}

export async function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const projects = await getProjects(locale);
  const year = new Date().getFullYear();

  return (
    <footer data-tone="dark" className="relative z-1 bg-ink text-paper">
      <div className="container-x pt-24 pb-10 md:pt-36">
        <p className="caption text-center text-paper/60">
          {t.home.geography} · {projectCount(projects.length, locale)}
        </p>
        <ul className="mt-10 flex flex-col items-center">
          {geography(projects).map(({ city, project }) => (
            <li key={city}>
              <Link
                href={localePath(locale, routes.project(project.slug))}
                className="display relative flex items-start gap-3 text-[clamp(2.5rem,8.5vw,8rem)] transition-opacity duration-300 hover:opacity-60"
              >
                {city}
                <span className="caption mt-[0.6em] text-[0.625rem] tracking-normal text-paper/60 normal-case">
                  {project.year}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-20 flex flex-col items-center gap-5 text-center md:mt-28">
          <p className="caption text-paper/60">{t.footer.cta}</p>
          <Link href={localePath(locale, routes.contacts)} className="pill pill-light">
            {t.footer.ctaLink}
          </Link>
        </div>

        <div className="mt-20 grid gap-10 border-t border-paper/15 pt-8 sm:grid-cols-2 md:mt-28 md:grid-cols-4">
          <div>
            <p className="caption text-paper/50">{t.contacts.address}</p>
            <p className="mt-3 max-w-[22ch] text-sm leading-relaxed">{t.contacts.addressValue}</p>
          </div>
          <div>
            <p className="caption text-paper/50">{t.contacts.email}</p>
            <a href={`mailto:${contact.email}`} className="link-underline mt-3 inline-block text-sm">
              {contact.email}
            </a>
          </div>
          <div>
            <p className="caption text-paper/50">{t.contacts.phone}</p>
            <a href={contact.phoneHref} className="link-underline mt-3 inline-block text-sm">
              {contact.phone}
            </a>
          </div>
          <nav aria-label={t.brand}>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link className="link-underline" href={localePath(locale, routes.projects)}>
                  {t.nav.projects}
                </Link>
              </li>
              <li>
                <Link className="link-underline" href={localePath(locale, routes.about)}>
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link className="link-underline" href={localePath(locale, routes.contacts)}>
                  {t.nav.contacts}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="caption mt-16 flex flex-col gap-2 text-paper/50 md:flex-row md:justify-between">
          <span>
            © {year} {t.brand}
          </span>
          <span className="normal-case">{t.footer.rights}</span>
        </div>
      </div>
    </footer>
  );
}
