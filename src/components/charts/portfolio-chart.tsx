"use client";

import { useCallback, useMemo, useState } from "react";
import { useAreaChart } from "./use-chart";
import { num, pct, sek, trendClass } from "@/lib/format";
import { cn } from "@/lib/utils";

type P = { t: number; value: number; dev: number };
const RANGES = [
  ["1M", 31],
  ["3M", 92],
  ["IÅ", -1],
  ["1Å", 366],
  ["3Å", 1096],
  ["Max", 0],
] as const;

export function PortfolioChart({ points, height = 260 }: { points: P[]; height?: number }) {
  const [range, setRange] = useState<(typeof RANGES)[number][0]>("1Å");
  const [mode, setMode] = useState<"dev" | "value">("dev");

  const slice = useMemo(() => {
    const days = RANGES.find((r) => r[0] === range)![1];
    if (days === 0) return points;
    const from = days === -1 ? Date.UTC(new Date().getFullYear(), 0, 1) / 1000 - 86400 * 3 : Date.now() / 1000 - days * 86400;
    let s = points.filter((p) => p.t >= from);
    if (days === -1) {
      const before = points.filter((p) => p.t < Date.UTC(new Date().getFullYear(), 0, 1) / 1000);
      if (before.length) s = [before[before.length - 1], ...points.filter((p) => p.t >= Date.UTC(new Date().getFullYear(), 0, 1) / 1000)];
    }
    return s.length ? s : points;
  }, [points, range]);

  const data = useMemo(() => {
    if (!slice.length) return [];
    if (mode === "value") return slice.map((p) => ({ t: p.t, v: p.value }));
    const base = 1 + slice[0].dev / 100;
    return slice.map((p) => ({ t: p.t, v: ((1 + p.dev / 100) / base - 1) * 100 }));
  }, [slice, mode]);

  const change = data.length ? (mode === "dev" ? data[data.length - 1].v : data[data.length - 1].v - data[0].v) : null;
  const fmt = useCallback((v: number) => (mode === "dev" ? `${num(v, 2)} %` : `${num(v, 0)} kr`), [mode]);
  const ref = useAreaChart({ data, height, positive: (change ?? 0) >= 0, intraday: false, baseline: mode === "dev" ? 0 : null, format: fmt });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {RANGES.map(([r]) => (
            <button key={r} onClick={() => setRange(r)} className={cn("chip", r === range && "chip-active")}>
              {r === "IÅ" ? "I år" : r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-sm font-semibold", trendClass(change))}>{change == null ? "" : mode === "dev" ? pct(change) : `${change > 0 ? "+" : ""}${sek(change, 0)}`}</span>
          <div className="flex rounded-full bg-surface-2 p-0.5 text-xs">
            <button onClick={() => setMode("dev")} className={cn("rounded-full px-2.5 py-1", mode === "dev" ? "bg-surface shadow-sm" : "text-muted")}>
              Utveckling
            </button>
            <button onClick={() => setMode("value")} className={cn("rounded-full px-2.5 py-1", mode === "value" ? "bg-surface shadow-sm" : "text-muted")}>
              Värde
            </button>
          </div>
        </div>
      </div>
      <div className="relative" style={{ height }}>
        <div ref={ref} className="absolute inset-0" />
        {!points.length ? <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">Ingen historik ännu</div> : null}
      </div>
    </div>
  );
}
