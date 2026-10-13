import type { Dictionary } from "@/lib/i18n";
import { IntroSkip } from "./IntroSkip";

/**
 * Entry splash over the hero: the wordmark rises letter by letter, a drafting
 * rule draws under it, then everything lifts away. CSS-only (see .intro in
 * globals.css); the inline head script decides whether it plays at all.
 */
export function Intro({ t }: { t: Dictionary }) {
  return (
    <div className="intro fixed inset-0 z-70 flex flex-col justify-end bg-ink/50 text-paper">
      <div className="container-x pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-10">
        <p aria-hidden="true" className="display flex overflow-hidden text-[clamp(5.5rem,27vw,30rem)] leading-[0.82]">
          {[...t.wordmark].map((letter, i) => (
            <span key={i} className="intro-letter" style={{ "--i": i } as React.CSSProperties}>
              {letter}
            </span>
          ))}
        </p>
        <div aria-hidden="true" className="intro-rule mt-4 h-px bg-paper/60 md:mt-6" />
        <div className="mt-4 flex items-center justify-between gap-4 md:mt-6">
          <p className="caption text-paper/80">
            {t.tagline} · {t.city} · {t.since}
          </p>
          <IntroSkip label={t.intro.skip} />
        </div>
      </div>
    </div>
  );
}
