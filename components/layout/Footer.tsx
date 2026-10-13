import Link from "next/link";
import { contact, getDictionary } from "@/lib/i18n";
import { localePath, routes } from "@/lib/paths";
import type { Locale } from "@/lib/types";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();
  return (
    <footer data-tone="dark" className="relative z-1 bg-ink text-paper">
      <div className="container-x pt-24 pb-10 md:pt-36">
        <p className="caption text-paper/60">{t.footer.cta}</p>
        <Link
          href={localePath(locale, routes.contacts)}
          className="group display mt-5 inline-flex items-baseline gap-[0.25em] text-[clamp(3rem,10vw,10rem)]"
        >
          <span className="link-underline">{t.footer.ctaLink}</span>
          <span aria-hidden="true" className="transition-transform duration-500 ease-out-expo group-hover:translate-x-3">
            →
          </span>
        </Link>

        <div className="mt-20 grid gap-10 border-t border-paper/15 pt-8 sm:grid-cols-2 md:mt-32 md:grid-cols-4">
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
