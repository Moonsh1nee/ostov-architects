import { fontVariables } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { INTRO_SCRIPT } from "../intro-script";
import { MotionRoot } from "../motion/MotionRoot";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = getDictionary(locale);
  return (
    // The intro script sets data-intro before hydration, hence suppressHydrationWarning.
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      {/* Raw <head> is valid in an App Router root layout (the rule targets pages/), and a
          parser-blocking inline script is the only way to decide on the intro before first paint. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
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
        {/* No z-index here: a stacking context on <main> would trap the fixed intro below the header. */}
        <main id="main" className="relative">
          {children}
        </main>
        <Footer locale={locale} />
        <div data-transition-overlay aria-hidden="true" className="transition-overlay" />
        <MotionRoot />
      </body>
    </html>
  );
}
