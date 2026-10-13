// Deterministic geometric "portrait" per team member: the bureau is fictional,
// so no photos of real people. Same name always yields the same composition.

function hash(input: string): number {
  let h = 2166136261;
  for (const ch of input) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

const W = 300;
const H = 375;

export function AbstractPortrait({ name, className }: { name: string; className?: string }) {
  const r = rng(hash(name));
  const pick = <T,>(items: readonly T[]) => items[Math.floor(r() * items.length)]!;
  const horizon = Math.round(H * (0.45 + r() * 0.25));
  const arcR = Math.round(70 + r() * 70);
  const arcX = Math.round(60 + r() * 180);
  const colX = Math.round(30 + r() * 220);
  const colW = Math.round(14 + r() * 26);
  const accentOn = r() > 0.45;
  const shape = pick(["arc", "circle", "gable"] as const);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={name} preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill="var(--paper-deep)" />
      <rect y={horizon} width={W} height={H - horizon} fill="var(--ink)" opacity="0.08" />
      {shape === "arc" && (
        <path
          d={`M ${arcX - arcR} ${horizon} A ${arcR} ${arcR} 0 0 1 ${arcX + arcR} ${horizon} Z`}
          fill="var(--ink)"
          opacity="0.85"
        />
      )}
      {shape === "circle" && <circle cx={arcX} cy={horizon - arcR * 0.6} r={arcR * 0.55} fill="var(--ink)" opacity="0.85" />}
      {shape === "gable" && (
        <path
          d={`M ${arcX - arcR} ${horizon} L ${arcX} ${horizon - arcR * 1.2} L ${arcX + arcR} ${horizon} Z`}
          fill="var(--ink)"
          opacity="0.85"
        />
      )}
      <rect x={colX} y={horizon - 150} width={colW} height={150 + (H - horizon)} fill={accentOn ? "var(--accent)" : "var(--paper)"} />
      <line x1="0" y1={horizon} x2={W} y2={horizon} stroke="var(--ink)" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
