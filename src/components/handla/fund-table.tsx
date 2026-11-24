"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, X } from "lucide-react";
import { dateSv, num, pct, price, trendClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RiskBars, Stars } from "./common";

export type FundRow = {
  id: number;
  name: string;
  href: string;
  company: string | null;
  category: string | null;
  tags: string[];
  currency: string;
  nav: number | null;
  navDate: string | null;
  today: number | null;
  m1: number | null;
  m3: number | null;
  ytd: number | null;
  y1: number | null;
  y3: number | null;
  y5: number | null;
  fee: number | null;
  risk: number | null;
  owners: number;
  rating: number | null;
  min: number;
};

const VIEWS = {
  sammanfattning: { label: "Sammanfattning", cols: ["y1", "y3", "y5", "fee", "owners", "risk", "rating"] },
  utveckling: { label: "Utveckling", cols: ["today", "m1", "m3", "ytd", "y1", "y3", "y5"] },
  avgifter: { label: "Avgifter", cols: ["fee", "courtage", "min"] },
  fondinfo: { label: "Fondinfo", cols: ["company", "category", "currency", "risk"] },
  handelsinfo: { label: "Handelsinfo", cols: ["nav", "navDate", "cutoff", "settle"] },
} as const;

const COL: Record<string, { label: string; render: (f: FundRow) => React.ReactNode; num?: boolean; sort?: keyof FundRow }> = {
  today: { label: "Idag", render: (f) => <span className={trendClass(f.today)}>{pct(f.today)}</span>, num: true, sort: "today" },
  m1: { label: "Utv. 1 mån", render: (f) => <span className={trendClass(f.m1)}>{pct(f.m1)}</span>, num: true, sort: "m1" },
  m3: { label: "Utv. 3 mån", render: (f) => <span className={trendClass(f.m3)}>{pct(f.m3)}</span>, num: true, sort: "m3" },
  ytd: { label: "Utv. i år", render: (f) => <span className={trendClass(f.ytd)}>{pct(f.ytd)}</span>, num: true, sort: "ytd" },
  y1: { label: "Utv. 1 år", render: (f) => <span className={trendClass(f.y1)}>{pct(f.y1)}</span>, num: true, sort: "y1" },
  y3: { label: "Utv. 3 år", render: (f) => <span className={trendClass(f.y3)}>{pct(f.y3)}</span>, num: true, sort: "y3" },
  y5: { label: "Utv. 5 år", render: (f) => <span className={trendClass(f.y5)}>{pct(f.y5)}</span>, num: true, sort: "y5" },
  fee: { label: "Total avgift", render: (f) => (f.fee != null ? `${num(f.fee, 2)} %` : "–"), num: true, sort: "fee" },
  owners: { label: "Antal ägare", render: (f) => `${num(f.owners, 0)} st`, num: true, sort: "owners" },
  risk: { label: "Risk", render: (f) => <RiskBars value={f.risk} />, sort: "risk" },
  rating: { label: "Spira-betyg", render: (f) => <Stars value={f.rating} />, sort: "rating" },
  courtage: { label: "Courtage", render: () => "0 kr", num: true },
  min: { label: "Minsta köp", render: (f) => `${num(f.min, 0)} kr`, num: true, sort: "min" },
  company: { label: "Fondbolag", render: (f) => f.company ?? "–" },
  category: { label: "Kategori", render: (f) => f.category ?? "–" },
  currency: { label: "Valuta", render: (f) => f.currency },
  nav: { label: "NAV-kurs", render: (f) => price(f.nav), num: true, sort: "nav" },
  navDate: { label: "NAV-datum", render: (f) => dateSv(f.navDate) },
  cutoff: { label: "Brytpunkt", render: () => "15:00" },
  settle: { label: "Köp/sälj handlas", render: () => "Samma dag" },
};

export function FundTable({ rows, filters, initial }: { rows: FundRow[]; filters: Record<string, { label: string; options: { key: string; label: string }[] }>; initial: { tag?: string; sort?: string } }) {
  const [view, setView] = useState<keyof typeof VIEWS>("sammanfattning");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Record<string, string[]>>(initial.tag ? { tag: [initial.tag] } : {});
  const [open, setOpen] = useState<string | null>(null);
  const [sort, setSort] = useState(initial.sort ?? "-y3");
  const [limit, setLimit] = useState(20);

  const list = useMemo(() => {
    let r = rows;
    if (q.trim()) r = r.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
    if (sel.tag?.length) r = r.filter((f) => sel.tag.some((t) => f.tags.includes(t)));
    if (sel.company?.length) r = r.filter((f) => sel.company.includes(f.company ?? ""));
    if (sel.fee?.length)
      r = r.filter((f) => sel.fee.some((k) => (k === "low" ? (f.fee ?? 9) <= 0.5 : k === "mid" ? (f.fee ?? 9) > 0.5 && (f.fee ?? 9) <= 1.2 : (f.fee ?? 0) > 1.2)));
    if (sel.risk?.length) r = r.filter((f) => sel.risk.includes(String(f.risk)));
    const desc = sort.startsWith("-");
    const key = sort.replace("-", "") as keyof FundRow;
    return [...r].sort((a, b) => {
      if (key === "name") return (desc ? -1 : 1) * a.name.localeCompare(b.name, "sv");
      const x = (a[key] as number | null) ?? (desc ? -Infinity : Infinity);
      const y = (b[key] as number | null) ?? (desc ? -Infinity : Infinity);
      return desc ? y - x : x - y;
    });
  }, [rows, q, sel, sort]);

  const toggle = (k: string, v: string) => setSel((s) => ({ ...s, [k]: s[k]?.includes(v) ? s[k].filter((x) => x !== v) : [...(s[k] ?? []), v] }));
  const sortTh = (k: string, label: string, isNum?: boolean, sortKey?: string) => (
    <th key={k} className={cn(isNum && "num", sortKey && "cursor-pointer select-none")} onClick={() => sortKey && setSort(sort === `-${sortKey}` ? sortKey : `-${sortKey}`)}>
      <span className={cn(sortKey && sort.replace("-", "") === sortKey && "rounded bg-surface-2 px-1 text-fg")}>
        {label}
        {sortKey ? (sort === `-${sortKey}` ? " ↓" : sort === sortKey ? " ↑" : " ↕") : ""}
      </span>
    </th>
  );

  return (
    <div>
      <label className="mb-3 flex w-full items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 sm:w-64">
        <Search className="h-4 w-4 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök på namn" className="w-full bg-transparent text-sm outline-none" aria-label="Sök på namn" />
      </label>
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
                <button className="mt-1 w-full py-1 text-xs text-brand" onClick={() => setOpen(null)}>
                  Klar
                </button>
              </div>
            ) : null}
          </div>
        ))}
        {Object.values(sel).some((v) => v.length) ? (
          <button className="chip gap-1 py-1.5 text-sm" onClick={() => setSel({})}>
            <X className="h-3.5 w-3.5" /> Rensa filter
          </button>
        ) : null}
      </div>
      <div className="card overflow-hidden">
        <div className="flex gap-1 overflow-x-auto border-b border-border px-2">
          {(Object.keys(VIEWS) as (keyof typeof VIEWS)[]).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("-mb-px border-b-2 px-3 py-2.5 text-sm whitespace-nowrap", view === v ? "border-brand font-semibold" : "border-transparent text-muted hover:text-fg")}>
              {VIEWS[v].label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {sortTh("name", "Namn", false, "name")}
                {VIEWS[view].cols.map((c) => sortTh(c, COL[c].label, COL[c].num, COL[c].sort as string | undefined))}
              </tr>
            </thead>
            <tbody>
              {list.slice(0, limit).map((f) => (
                <tr key={f.id}>
                  <td className="max-w-[20rem] truncate">
                    <Link href={f.href} className="text-brand hover:underline">
                      {f.name}
                    </Link>
                  </td>
                  {VIEWS[view].cols.map((c) => (
                    <td key={c} className={cn(COL[c].num && "num")}>
                      {COL[c].render(f)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-5 flex flex-col items-center gap-2 text-sm">
        <span>
          Visar <b>{Math.min(limit, list.length)}</b> av {list.length} fonder
        </span>
        {limit < list.length ? (
          <button className="btn-secondary mt-1 px-16" onClick={() => setLimit(limit + 20)}>
            Visa fler
          </button>
        ) : null}
      </div>
      <p className="mt-4 text-xs text-muted">Spira-betyg (1–5) bygger på fondens 3-årsavkastning jämfört med övriga fonder i listan. Riskklass är indikativ.</p>
    </div>
  );
}
