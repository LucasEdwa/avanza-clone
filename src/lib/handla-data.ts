import { listInstruments, type Row } from "@/lib/market/lists";
import { getFxRates } from "@/lib/market/fx";
import { instrumentPath } from "@/lib/utils";
import type { ScreenerRow } from "@/components/handla/screener";

export async function stockRows(): Promise<{ rows: Row[]; screener: ScreenerRow[] }> {
  const [rows, fx] = await Promise.all([listInstruments(["STOCK"], undefined, { perf: true }), getFxRates()]);
  const screener = rows.map((r) => ({
    id: r.id,
    name: r.name.replace(/\s*\(publ\)|,? Inc\.?$|Aktiebolag|\bAB\b/g, "").trim(),
    symbol: r.ticker,
    href: instrumentPath(r),
    country: r.country,
    segment: r.segment,
    sector: r.sector,
    currency: r.currency,
    last: r.quote?.last ?? null,
    today: r.quote?.changePct ?? null,
    ytd: r.perf?.ytd ?? null,
    y1: r.perf?.y1 ?? null,
    y3: r.perf?.y3 ?? null,
    dy: r.quote?.dividendYield ?? null,
    pe: r.quote?.pe ?? null,
    cap: r.quote?.marketCap ?? null,
    capSek: r.quote?.marketCap != null ? r.quote.marketCap * (fx[r.currency] ?? 1) : null,
    owners: r.owners,
  }));
  return { rows, screener };
}

import { fundTags, FUND_REGIONS, FUND_THEMES } from "@/lib/fund-tags";
import type { FundRow } from "@/components/handla/fund-table";

export async function fundRows(): Promise<FundRow[]> {
  const rows = await listInstruments(["FUND"], undefined, { perf: true });
  const withY3 = rows.map((r) => r.perf?.y3 ?? r.perf?.y1 ?? null).filter((x): x is number => x != null).sort((a, b) => a - b);
  const rating = (v: number | null) => {
    if (v == null || !withY3.length) return null;
    const rank = withY3.findIndex((x) => x >= v) / withY3.length;
    return Math.min(5, Math.max(1, Math.ceil(rank * 5 + 0.0001)));
  };
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    href: instrumentPath(r),
    company: r.fundCompany,
    category: r.fundCategory,
    tags: [...fundTags(r)],
    currency: r.currency,
    nav: r.quote?.last ?? null,
    navDate: r.quote?.marketTime?.toISOString() ?? null,
    today: r.quote?.changePct ?? null,
    m1: r.perf?.m1 ?? null,
    m3: r.perf?.m3 ?? null,
    ytd: r.perf?.ytd ?? null,
    y1: r.perf?.y1 ?? null,
    y3: r.perf?.y3 ?? null,
    y5: r.perf?.y5 ?? null,
    fee: r.fundFee,
    risk: r.fundRisk,
    owners: r.owners,
    rating: rating(r.perf?.y3 ?? r.perf?.y1 ?? null),
    min: r.minInvestment ?? 100,
  }));
}

export function fundFilters(rows: FundRow[]) {
  return {
    tag: { label: "Fondtyp & region", options: [...FUND_REGIONS, ...FUND_THEMES].map((t) => ({ key: t.key, label: t.label })) },
    company: { label: "Bolag", options: [...new Set(rows.map((r) => r.company).filter(Boolean))].sort().map((c) => ({ key: c!, label: c! })) },
    fee: { label: "Avgift", options: [{ key: "low", label: "Upp till 0,5 %" }, { key: "mid", label: "0,5–1,2 %" }, { key: "high", label: "Över 1,2 %" }] },
    risk: { label: "Risk", options: [3, 4, 5, 6, 7].map((n) => ({ key: String(n), label: `Risk ${n}` })) },
  };
}
