export function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="caption flex items-center gap-3 text-ink-soft">
      <span className="text-accent">{index}</span>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-40" />
      {children}
    </p>
  );
}
