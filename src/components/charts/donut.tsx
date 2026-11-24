import { pct } from "@/lib/format";

const COLORS = ["#4a37e6", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#64748b"];

export function Donut({ items, size = 140 }: { items: { label: string; value: number }[]; size?: number }) {
  const total = items.reduce((s, i) => s + Math.max(0, i.value), 0) || 1;
  const r = 50;
  const c = 2 * Math.PI * r;
  const segs = items.reduce<{ len: number; off: number }[]>((acc, it) => {
    const prev = acc[acc.length - 1];
    acc.push({ len: (Math.max(0, it.value) / total) * c, off: prev ? prev.off + prev.len : 0 });
    return acc;
  }, []);
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90 shrink-0">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="16" />
        {items.map((it, i) => (
          <circle key={it.label} cx="60" cy="60" r={r} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="16" strokeDasharray={`${segs[i].len} ${c - segs[i].len}`} strokeDashoffset={-segs[i].off} />
        ))}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-muted">{it.label}</span>
            <span className="ml-auto pl-3 font-medium tabular-nums">{pct((it.value / total) * 100, 1, false)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
