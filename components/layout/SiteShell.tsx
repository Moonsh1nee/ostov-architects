import { fontVariables } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { MotionRoot } from "../motion/MotionRoot";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = getDictionary(locale);
  return (
    <html lang={locale} className={fontVariables}>
      <body className="bg-paper text-ink">
        <a
          href="#main"
          className="caption sr-only z-50 bg-ink px-4 py-3 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t.skipLink}
        </a>
        <div className="axes" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <Header locale={locale} />
        <main id="main" className="relative z-1">
          {children}
        </main>
        <Footer locale={locale} />
        <div data-transition-overlay aria-hidden="true" className="transition-overlay" />
        <MotionRoot />
      </body>
    </html>
  );
}
