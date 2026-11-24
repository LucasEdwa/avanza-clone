"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, MoreVertical, Search, X } from "lucide-react";
import { num, pct, price, trendClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FLAG } from "./common";

export type ScreenerRow = {
  id: number;
  name: string;
  symbol: string;
  href: string;
  country: string | null;
  segment: string | null;
  sector: string | null;
  currency: string;
  last: number | null;
  today: number | null;
  ytd: number | null;
  y1: number | null;
  y3: number | null;
  dy: number | null;
  pe: number | null;
  cap: number | null;
  capSek: number | null;
  owners: number;
};

type Filter = { label: string; options: { key: string; label: string; test: (r: ScreenerRow) => boolean }[] };

const FILTERS: Record<string, Filter> = {
  sektor: { label: "Bransch", options: [] },
  lista: {
    label: "Land och lista",
    options: [
      { key: "Large Cap", label: "Sverige · Large Cap", test: (r) => r.segment === "Large Cap" },
      { key: "Mid Cap", label: "Sverige · Mid Cap", test: (r) => r.segment === "Mid Cap" },
      { key: "Small Cap", label: "Sverige · Small Cap", test: (r) => r.segment === "Small Cap" || r.segment === "First North/Övrigt" },
      { key: "USA", label: "USA", test: (r) => r.country === "US" },
      { key: "DK", label: "Danmark", test: (r) => r.country === "DK" },
      { key: "NO", label: "Norge", test: (r) => r.country === "NO" },
    ],
  },
  pe: {
    label: "P/E-tal",
    options: [
      { key: "neg", label: "Negativt", test: (r) => r.pe != null && r.pe < 0 },
      { key: "0-10", label: "0–10", test: (r) => r.pe != null && r.pe >= 0 && r.pe < 10 },
      { key: "10-20", label: "10–20", test: (r) => r.pe != null && r.pe >= 10 && r.pe < 20 },
      { key: "20-40", label: "20–40", test: (r) => r.pe != null && r.pe >= 20 && r.pe < 40 },
      { key: "40+", label: "Över 40", test: (r) => r.pe != null && r.pe >= 40 },
    ],
  },
  cap: {
    label: "Börsvärde",
    options: [
      { key: "s", label: "Under 2 mdr kr", test: (r) => (r.capSek ?? 0) < 2e9 },
      { key: "m", label: "2–20 mdr kr", test: (r) => (r.capSek ?? 0) >= 2e9 && (r.capSek ?? 0) < 2e10 },
      { key: "l", label: "20–200 mdr kr", test: (r) => (r.capSek ?? 0) >= 2e10 && (r.capSek ?? 0) < 2e11 },
      { key: "xl", label: "Över 200 mdr kr", test: (r) => (r.capSek ?? 0) >= 2e11 },
    ],
  },
  utv: {
    label: "Historisk utveckling",
    options: [
      { key: "ytd+", label: "Upp i år", test: (r) => (r.ytd ?? -1) > 0 },
      { key: "ytd-", label: "Ner i år", test: (r) => (r.ytd ?? 1) < 0 },
      { key: "y1+20", label: "Över +20 % på 1 år", test: (r) => (r.y1 ?? -1) > 20 },
      { key: "y3+50", label: "Över +50 % på 3 år", test: (r) => (r.y3 ?? -1) > 50 },
    ],
  },
  dy: {
    label: "Direktavkastning",
    options: [
      { key: "0", label: "Ingen utdelning", test: (r) => !r.dy },
      { key: "0-2", label: "0–2 %", test: (r) => !!r.dy && r.dy < 2 },
      { key: "2-4", label: "2–4 %", test: (r) => (r.dy ?? 0) >= 2 && (r.dy ?? 0) < 4 },
      { key: "4+", label: "Över 4 %", test: (r) => (r.dy ?? 0) >= 4 },
    ],
  },
};

const COLS = [
  { key: "today", label: "Utv. idag" },
  { key: "ytd", label: "Utv. i år" },
  { key: "y1", label: "Utv. 1 år" },
  { key: "last", label: "Senast" },
  { key: "dy", label: "Direktavk." },
  { key: "pe", label: "P/E-tal" },
  { key: "owners", label: "Antal ägare" },
] as const;

export function Screener({ rows, initial }: { rows: ScreenerRow[]; initial: { sort?: string; lista?: string; sektor?: string; q?: string } }) {
  const sectors = useMemo(() => [...new Set(rows.map((r) => r.sector).filter(Boolean))].sort() as string[], [rows]);
  const filters: Record<string, Filter> = {
    ...FILTERS,
    sektor: { label: "Bransch", options: sectors.map((s) => ({ key: s, label: s, test: (r: ScreenerRow) => r.sector === s })) },
  };
  const [q, setQ] = useState(initial.q ?? "");
  const [sel, setSel] = useState<Record<string, string[]>>({
    ...(initial.lista ? { lista: [initial.lista] } : {}),
    ...(initial.sektor ? { sektor: [initial.sektor] } : {}),
  });
  const [open, setOpen] = useState<string | null>(null);
  const [sort, setSort] = useState(initial.sort ?? "-cap");
  const [limit, setLimit] = useState(20);

  const list = useMemo(() => {
    let r = rows;
    if (q.trim()) {
      const t = q.toLowerCase();
      r = r.filter((x) => x.name.toLowerCase().includes(t) || x.symbol.toLowerCase().includes(t));
    }
    for (const [k, keys] of Object.entries(sel)) {
      if (!keys.length) continue;
      const opts = filters[k].options.filter((o) => keys.includes(o.key));
      r = r.filter((x) => opts.some((o) => o.test(x)));
    }
    const desc = sort.startsWith("-");
    const key = sort.replace("-", "") as keyof ScreenerRow;
    return [...r].sort((a, b) => {
      const x = a[key];
      const y = b[key];
      if (key === "name") return (desc ? -1 : 1) * String(x).localeCompare(String(y), "sv");
      const xv = typeof x === "number" ? x : desc ? -Infinity : Infinity;
      const yv = typeof y === "number" ? y : desc ? -Infinity : Infinity;
      return desc ? yv - xv : xv - yv;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, sel, sort]);

  const toggle = (k: string, v: string) => setSel((s) => ({ ...s, [k]: s[k]?.includes(v) ? s[k].filter((x) => x !== v) : [...(s[k] ?? []), v] }));
  const activeCount = Object.values(sel).reduce((n, v) => n + v.length, 0);
  const th = (key: string, label: string, right = true) => (
    <th key={key} className={cn(right && "num", "cursor-pointer select-none")} onClick={() => setSort(sort === `-${key}` ? key : `-${key}`)}>
      <span className={cn("inline-flex items-center gap-1", sort.replace("-", "") === key && "rounded bg-surface-2 px-1 text-fg")}>
        {label}
        {sort === `-${key}` ? "↓" : sort === key ? "↑" : "↕"}
      </span>
    </th>
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="flex w-full items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 sm:w-64">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök på namn" className="w-full bg-transparent text-sm outline-none" aria-label="Sök på namn" />
        </label>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(filters).map(([k, f]) => (
          <div key={k} className="relative">
            <button onClick={() => setOpen(open === k ? null : k)} className={cn("chip gap-1 py-1.5 text-sm", sel[k]?.length && "chip-active")}>
              {f.label}
              {sel[k]?.length ? ` (${sel[k].length})` : ""} <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {open === k ? (
              <div className="card absolute z-30 mt-1 max-h-80 w-60 overflow-y-auto p-2 shadow-xl">
                {f.options.map((o) => (
                  <label key={o.key} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">
                    <input type="checkbox" checked={sel[k]?.includes(o.key) ?? false} onChange={() => toggle(k, o.key)} />
                    {o.label}
                  </label>
                ))}
                <button className="mt-1 w-full rounded-lg py-1 text-xs text-brand" onClick={() => setOpen(null)}>
                  Klar
                </button>
              </div>
            ) : null}
          </div>
        ))}
        {activeCount ? (
          <button className="chip gap-1 py-1.5 text-sm" onClick={() => setSel({})}>
            <X className="h-3.5 w-3.5" /> Rensa filter
          </button>
        ) : null}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-border px-4 py-2.5 text-sm font-semibold">Standard</div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {th("name", "Namn", false)}
                {COLS.map((c) => th(c.key, c.label))}
                <th />
              </tr>
            </thead>
            <tbody>
              {list.slice(0, limit).map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={r.href} className="flex items-center gap-2 font-medium text-brand hover:underline">
                      <span>{FLAG[r.country ?? ""] ?? "🏳️"}</span>
                      {r.name}
                    </Link>
                  </td>
                  <td className={cn("num", trendClass(r.today))}>{pct(r.today)}</td>
                  <td className={cn("num", trendClass(r.ytd))}>{pct(r.ytd)}</td>
                  <td className={cn("num", trendClass(r.y1))}>{pct(r.y1)}</td>
                  <td className="num">
                    {price(r.last)} {r.currency}
                  </td>
                  <td className="num">{r.dy != null ? pct(r.dy, 2, false) : "0,00 %"}</td>
                  <td className="num">{num(r.pe, 2)}</td>
                  <td className="num">{num(r.owners, 0)} st</td>
                  <td>
                    <details className="relative">
                      <summary className="cursor-pointer list-none rounded p-1 hover:bg-surface-2" aria-label="Fler val">
                        <MoreVertical className="h-4 w-4" />
                      </summary>
                      <div className="card absolute right-0 z-20 w-36 py-1 shadow-xl">
                        <Link href={`${r.href}?sida=kop`} className="block px-3 py-1.5 text-sm text-pos hover:bg-surface-2">
                          Köp
                        </Link>
                        <Link href={`${r.href}?sida=salj`} className="block px-3 py-1.5 text-sm text-neg hover:bg-surface-2">
                          Sälj
                        </Link>
                        <Link href={r.href} className="block px-3 py-1.5 text-sm hover:bg-surface-2">
                          Om aktien
                        </Link>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-5 flex flex-col items-center gap-2 text-sm">
        <span>
          Visar <b>{Math.min(limit, list.length)}</b> av {list.length} aktier
        </span>
        <span className="h-1 w-40 overflow-hidden rounded-full bg-border">
          <span className="block h-full bg-pos" style={{ width: `${(Math.min(limit, list.length) / Math.max(1, list.length)) * 100}%` }} />
        </span>
        {limit < list.length ? (
          <button className="btn-secondary mt-2 px-16" onClick={() => setLimit(limit + 20)}>
            Visa fler
          </button>
        ) : null}
      </div>
    </div>
  );
}
