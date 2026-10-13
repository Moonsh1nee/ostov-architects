interface PageHeaderProps {
  title: string;
  lead?: string;
  /** Small mono annotation beside the title, e.g. a count. */
  meta?: string;
}

export function PageHeader({ title, lead, meta }: PageHeaderProps) {
  return (
    <header className="grid gap-8 pt-[calc(var(--header-h)+3.5rem)] pb-12 md:grid-cols-12 md:pt-[calc(var(--header-h)+7rem)] md:pb-20">
      <h1 data-split-lines className="display text-[clamp(3.25rem,12vw,12rem)] md:col-span-8">
        {title}
        {meta && <sup className="caption ml-3 align-top text-[0.75rem] tracking-normal text-ink-soft">{meta}</sup>}
      </h1>
      {lead && (
        <p data-reveal="fade" className="max-w-[34ch] self-end text-lg leading-snug text-ink-soft md:col-span-4">
          {lead}
        </p>
      )}
    </header>
  );
}
