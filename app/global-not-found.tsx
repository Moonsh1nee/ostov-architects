import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n";
import { BASE_PATH } from "@/lib/paths";
import { LOCALES } from "@/lib/types";
import "./globals.css";

export const metadata: Metadata = { title: "404 — Ostov Architects" };

// Rendered outside both locale layouts (and served by GitHub Pages as 404.html
// for any unknown URL), so it speaks both languages instead of guessing.
export default function GlobalNotFound() {
  return (
    <html lang="ru" className={fontVariables}>
      <body className="bg-paper text-ink">
        <main className="container-x flex min-h-svh flex-col justify-between py-10">
          <a href={`${BASE_PATH}/`} className="text-[1.0625rem] tracking-[-0.02em]">
            Ostov<span className="caption ml-2 align-middle text-[0.625rem] text-ink-soft">Architects</span>
          </a>
          <div>
            <p className="display text-[clamp(6rem,28vw,24rem)]">404</p>
            <div className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
              {LOCALES.map((locale) => {
                const t = getDictionary(locale);
                return (
                  <div key={locale} lang={locale}>
                    <h1 className="text-2xl tracking-[-0.02em]">{t.notFound.title}</h1>
                    <a
                      href={`${BASE_PATH}${locale === "ru" ? "/" : "/en/"}`}
                      className="caption link-underline mt-3 inline-block"
                    >
                      {t.notFound.back} →
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
