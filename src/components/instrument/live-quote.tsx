"use client";

import { useEffect, useRef, useState } from "react";
import { num, pct, signed, timeSv, trendClass } from "@/lib/format";
import { cn } from "@/lib/utils";

type Q = { last: number | null; change: number | null; changePct: number | null; bid: number | null; ask: number | null; high: number | null; low: number | null; volume: number | null; updatedAt: string; marketTime: string | null };

export function LiveQuote({ id, initial, currency, decimals = 2 }: { id: number; initial: Q; currency: string; decimals?: number }) {
  const [q, setQ] = useState<Q>(initial);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prev = useRef(initial.last);
  useEffect(() => {
    const t = setInterval(async () => {
      if (document.hidden) return;
      const r = await fetch(`/api/quotes?ids=${id}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null);
      const n: Q | undefined = r?.[id];
      if (!n) return;
      if (prev.current != null && n.last != null && n.last !== prev.current) {
        setFlash(n.last > prev.current ? "up" : "down");
        setTimeout(() => setFlash(null), 900);
      }
      prev.current = n.last;
      setQ(n);
    }, 15_000);
    return () => clearInterval(t);
  }, [id]);
  const d = q.last != null && q.last < 10 ? Math.max(decimals, 3) : decimals;
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={cn("rounded-md px-1 text-4xl font-bold tabular-nums transition-colors", flash === "up" && "bg-pos-soft", flash === "down" && "bg-neg-soft")}>
          {num(q.last, d)}
        </span>
        <span className="text-sm text-muted">{currency}</span>
        <span className={cn("text-lg font-semibold tabular-nums", trendClass(q.change))}>
          {signed(q.change, d)} ({pct(q.changePct)})
        </span>
      </div>
      <div className="mt-1 text-xs text-muted">Senast uppdaterad {timeSv(q.marketTime ?? q.updatedAt)} · uppdateras automatiskt · kurser kan vara fördröjda ca 15 min</div>
    </div>
  );
}
