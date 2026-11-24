"use client";

import { useCallback, useEffect, useState } from "react";
import { useAreaChart, type ChartPoint } from "./use-chart";
import { num, pct, trendClass } from "@/lib/format";
import { cn } from "@/lib/utils";

const RANGES = ["1D", "1V", "1M", "3M", "IÅ", "1Å", "3Å", "5Å", "MAX"] as const;
type Range = (typeof RANGES)[number];

export function PriceChart({ symbol, prevClose, height = 320, initialRange = "1D" }: { symbol: string; prevClose?: number | null; height?: number; initialRange?: Range }) {
  const [range, setRange] = useState<Range>(initialRange);
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stop = false;
    const load = () =>
      fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range)}`)
        .then((r) => r.json())
        .then((d) => {
          if (!stop) {
            setData(Array.isArray(d) ? d : []);
            setLoading(false);
          }
        });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    load();
    const t = range === "1D" ? setInterval(load, 60_000) : undefined;
    return () => {
      stop = true;
      if (t) clearInterval(t);
    };
  }, [symbol, range]);

  const base = range === "1D" && prevClose ? prevClose : data[0]?.v;
  const last = data[data.length - 1]?.v;
  const change = base && last ? (last / base - 1) * 100 : null;
  const fmt = useCallback((v: number) => num(v, 2, v < 10 ? 4 : 2), []);
  const ref = useAreaChart({ data, height, positive: (change ?? 0) >= 0, intraday: ["1D", "1V", "1M"].includes(range), baseline: range === "1D" ? prevClose : null, format: fmt });

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 overflow-x-auto">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} className={cn("chip", r === range && "chip-active")}>
              {r === "IÅ" ? "I år" : r === "MAX" ? "Max" : r}
            </button>
          ))}
        </div>
        <span className={cn("text-sm font-semibold", trendClass(change))}>{change != null ? pct(change) : ""}</span>
      </div>
      <div className="relative" style={{ height }}>
        <div ref={ref} className="absolute inset-0" />
        {loading ? <div className="skeleton absolute inset-0 opacity-60" /> : !data.length ? <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">Ingen kursdata</div> : null}
      </div>
    </div>
  );
}
