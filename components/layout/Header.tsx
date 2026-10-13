import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { localePath, routes } from "@/lib/paths";
import type { Locale } from "@/lib/types";
import { HeaderNav } from "./HeaderNav";

export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const links = [
    { href: localePath(locale, routes.projects), label: t.nav.projects },
    { href: localePath(locale, routes.about), label: t.nav.about },
    { href: localePath(locale, routes.contacts), label: t.nav.contacts },
  ];
  return (
    // data-tone is driven by HeaderNav: light text whenever a dark section sits under the bar.
    <header
      data-site-header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 text-ink transition-colors duration-300 data-[tone=dark]:text-paper"
    >
      <div className="container-x flex h-(--header-h) items-center justify-between">
        <Link
          href={localePath(locale, routes.home)}
          className="pointer-events-auto text-[1.0625rem] font-normal tracking-[-0.02em]"
          aria-label={t.brand}
        >
          Ostov<span className="caption ml-2 align-middle text-[0.625rem] opacity-70">Architects</span>
        </Link>
        <HeaderNav
          links={links}
          labels={{ open: t.menu.open, close: t.menu.close, switchTo: t.switchTo }}
        />
      </div>
    </header>
  );
}
