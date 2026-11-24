"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { pct, price } from "@/lib/format";
import { cn, INSTRUMENT_TYPE_LABEL } from "@/lib/utils";

type Hit = { id: number; name: string; ticker: string; type: string; currency: string; href: string; last: number | null; changePct: number | null };

export function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHits([]);
      return;
    }
    const c = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: c.signal })
        .then((r) => r.json())
        .then((h) => {
          setHits(h);
          setSel(0);
        })
        .catch(() => {});
    }, 150);
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [q]);

  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <div ref={ref} className="relative hidden sm:block">
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 focus-within:border-brand">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setSel((s) => Math.min(s + 1, hits.length - 1));
            else if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0));
            else if (e.key === "Enter") {
              if (hits[sel]) go(hits[sel].href);
              else if (q.trim()) go(`/sok?q=${encodeURIComponent(q)}`);
            } else if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Sök aktie, fond, ETF…"
          className="w-40 bg-transparent text-sm outline-none placeholder:text-muted lg:w-64"
          aria-label="Sök"
        />
      </div>
      {open && q.trim() ? (
        <div className="card absolute right-0 mt-2 w-[22rem] overflow-hidden shadow-xl">
          {hits.length === 0 ? (
            <div className="p-4 text-sm text-muted">Inga träffar</div>
          ) : (
            hits.map((h, i) => (
              <button
                key={h.id}
                onMouseEnter={() => setSel(i)}
                onClick={() => go(h.href)}
                className={cn("flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left", i === sel && "bg-surface-2")}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{h.name}</span>
                  <span className="text-xs text-muted">
                    {h.ticker} · {INSTRUMENT_TYPE_LABEL[h.type]}
                  </span>
                </span>
                <span className="text-right text-xs tabular-nums">
                  <span className="block">{price(h.last)}</span>
                  <span className={h.changePct == null ? "text-muted" : h.changePct >= 0 ? "text-pos" : "text-neg"}>{pct(h.changePct)}</span>
                </span>
              </button>
            ))
          )}
          <Link href={`/sok?q=${encodeURIComponent(q)}`} onClick={() => setOpen(false)} className="block border-t border-border px-4 py-2 text-center text-sm text-brand">
            Visa alla resultat
          </Link>
        </div>
      ) : null}
    </div>
  );
}
