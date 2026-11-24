import { cached } from "./cache";
import { yf, loose } from "./yahoo";
import { isMarketOpen, venueForSymbol } from "@/lib/market-hours";

export const RANGES = ["1D", "1V", "1M", "3M", "IÅ", "1Å", "3Å", "5Å", "MAX"] as const;
export type Range = (typeof RANGES)[number];
export type Point = { t: number; v: number };

const DAY = 86400_000;
type ChartResult = { quotes?: { date: Date | string; close: number | null }[] };

function rangeParams(range: Range): { period1: Date; interval: "5m" | "30m" | "60m" | "1d" | "1wk" | "1mo" } {
  const now = Date.now();
  switch (range) {
    case "1D":
      return { period1: new Date(now - 6 * DAY), interval: "5m" };
    case "1V":
      return { period1: new Date(now - 7 * DAY), interval: "30m" };
    case "1M":
      return { period1: new Date(now - 31 * DAY), interval: "60m" };
    case "3M":
      return { period1: new Date(now - 92 * DAY), interval: "1d" };
    case "IÅ": {
      const y = new Date().getFullYear();
      return { period1: new Date(Date.UTC(y - 1, 11, 31)), interval: "1d" };
    }
    case "1Å":
      return { period1: new Date(now - 366 * DAY), interval: "1d" };
    case "3Å":
      return { period1: new Date(now - 3 * 366 * DAY), interval: "1wk" };
    case "5Å":
      return { period1: new Date(now - 5 * 366 * DAY), interval: "1wk" };
    case "MAX":
      return { period1: new Date("1980-01-01"), interval: "1mo" };
  }
}

export async function getChart(symbol: string, range: Range): Promise<Point[]> {
  const ttl =
    range === "1D" ? (isMarketOpen(venueForSymbol(symbol)) ? 60_000 : 10 * 60_000) : range === "1V" ? 10 * 60_000 : 3600_000;
  const data = await cached<Point[]>(`chart:${symbol}:${range}`, ttl, async () => {
    const { period1, interval } = rangeParams(range);
    const r = (await yf.chart(symbol, { period1, interval }, loose)) as ChartResult;
    let pts = (r.quotes ?? [])
      .filter((q) => q.close != null)
      .map((q) => ({ t: Math.floor(new Date(q.date).getTime() / 1000), v: q.close as number }));
    if (range === "1D" && pts.length) {
      // keep only the latest trading session
      const lastDay = new Date(pts[pts.length - 1].t * 1000).toISOString().slice(0, 10);
      pts = pts.filter((p: Point) => new Date(p.t * 1000).toISOString().slice(0, 10) === lastDay);
    }
    // de-duplicate timestamps (lightweight-charts requires strictly ascending)
    const out: Point[] = [];
    for (const p of pts) if (!out.length || p.t > out[out.length - 1].t) out.push(p);
    return out;
  });
  return data ?? [];
}

/** Daily closes for portfolio history: map YYYY-MM-DD → close. */
export async function getDailyCloses(symbol: string, from: Date): Promise<Record<string, number>> {
  const key = `daily:${symbol}:${from.toISOString().slice(0, 7)}`;
  const data = await cached<Record<string, number>>(key, 6 * 3600_000, async () => {
    const r = (await yf.chart(symbol, { period1: new Date(from.getTime() - 10 * DAY), interval: "1d" }, loose)) as ChartResult;
    const out: Record<string, number> = {};
    for (const q of r.quotes ?? []) if (q.close != null) out[new Date(q.date).toISOString().slice(0, 10)] = q.close;
    return out;
  });
  return data ?? {};
}

export type Profile = {
  description?: string;
  sector?: string;
  industry?: string;
  employees?: number;
  website?: string;
  city?: string;
  country?: string;
  ceo?: string;
  beta?: number;
  priceToSales?: number;
  profitMargin?: number;
  revenue?: number;
  ebitda?: number;
  returnOnEquity?: number;
  debtToEquity?: number;
  exDividendDate?: string;
  dividendDate?: string;
  earningsDate?: string;
  targetPrice?: number;
  recommendation?: string;
  analysts?: number;
  // funds
  fundFamily?: string;
  category?: string;
  expenseRatio?: number;
  inception?: string;
  topHoldings?: { name: string; pct: number }[];
  sectorWeights?: { name: string; pct: number }[];
  returns?: { label: string; value: number }[];
};

type Any = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const raw = (v: unknown): number | undefined => {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "raw" in v) return (v as { raw: number }).raw;
  return undefined;
};
const dateStr = (v: unknown): string | undefined => {
  if (!v) return undefined;
  const d = v instanceof Date ? v : new Date(typeof v === "number" ? v * 1000 : String(v));
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
};

export async function getProfile(symbol: string, type: string): Promise<Profile | null> {
  return cached<Profile>(`profile:${symbol}`, 24 * 3600_000, async () => {
    if (type === "FUND" || type === "ETF") {
      const s = (await yf.quoteSummary(
        symbol,
        { modules: ["fundProfile", "topHoldings", "fundPerformance", "summaryProfile", "defaultKeyStatistics"] },
        loose,
      )) as Any;
      const fp = s.fundProfile ?? {};
      const th = s.topHoldings ?? {};
      const perf = s.fundPerformance?.trailingReturns ?? {};
      const ret = (k: string, label: string) => (raw(perf[k]) != null ? { label, value: raw(perf[k])! * 100 } : null);
      return {
        fundFamily: fp.family ?? undefined,
        category: fp.categoryName ?? undefined,
        expenseRatio: raw(fp.feesExpensesInvestment?.annualReportExpenseRatio),
        inception: dateStr(s.defaultKeyStatistics?.fundInceptionDate),
        description: s.summaryProfile?.longBusinessSummary ?? undefined,
        topHoldings: (th.holdings ?? [])
          .slice(0, 10)
          .map((h: Any) => ({ name: h.holdingName ?? h.symbol, pct: (raw(h.holdingPercent) ?? 0) * 100 })),
        sectorWeights: (th.sectorWeightings ?? [])
          .map((o: Any) => {
            const [k, v] = Object.entries(o)[0] ?? [];
            return { name: String(k), pct: (raw(v) ?? 0) * 100 };
          })
          .filter((x: { pct: number }) => x.pct > 0)
          .sort((a: { pct: number }, b: { pct: number }) => b.pct - a.pct),
        returns: [
          ret("ytd", "I år"),
          ret("oneYear", "1 år"),
          ret("threeYear", "3 år (årlig)"),
          ret("fiveYear", "5 år (årlig)"),
          ret("tenYear", "10 år (årlig)"),
        ].filter(Boolean) as { label: string; value: number }[],
      };
    }
    const s = (await yf.quoteSummary(
      symbol,
      {
        modules: ["assetProfile", "summaryDetail", "defaultKeyStatistics", "financialData", "calendarEvents"],
      },
      loose,
    )) as Any;
    const ap = s.assetProfile ?? {};
    const sd = s.summaryDetail ?? {};
    const ks = s.defaultKeyStatistics ?? {};
    const fd = s.financialData ?? {};
    const ce = s.calendarEvents ?? {};
    const ceo = (ap.companyOfficers ?? []).find((o: Any) => /CEO|Chief Executive|President/i.test(o.title ?? ""));
    return {
      description: ap.longBusinessSummary,
      sector: ap.sector,
      industry: ap.industry,
      employees: ap.fullTimeEmployees,
      website: ap.website,
      city: ap.city,
      country: ap.country,
      ceo: ceo?.name,
      beta: raw(sd.beta) ?? raw(ks.beta),
      priceToSales: raw(sd.priceToSalesTrailing12Months),
      profitMargin: raw(fd.profitMargins) ?? raw(ks.profitMargins),
      revenue: raw(fd.totalRevenue),
      ebitda: raw(fd.ebitda),
      returnOnEquity: raw(fd.returnOnEquity),
      debtToEquity: raw(fd.debtToEquity),
      exDividendDate: dateStr(sd.exDividendDate ?? ce.exDividendDate),
      dividendDate: dateStr(ce.dividendDate),
      earningsDate: dateStr(ce.earnings?.earningsDate?.[0]),
      targetPrice: raw(fd.targetMeanPrice),
      recommendation: fd.recommendationKey,
      analysts: raw(fd.numberOfAnalystOpinions),
    };
  });
}

export type NewsItem = { id: string; title: string; publisher: string; link: string; time: string; thumb?: string };

export async function getNews(query: string): Promise<NewsItem[]> {
  const data = await cached<NewsItem[]>(`news:${query}`, 30 * 60_000, async () => {
    const r = (await yf.search(query, { quotesCount: 0, newsCount: 10 }, loose)) as Any;
    return (r.news ?? []).map((x: Any) => ({
      id: x.uuid,
      title: x.title,
      publisher: x.publisher,
      link: x.link,
      time: new Date(
        typeof x.providerPublishTime === "number" ? x.providerPublishTime * 1000 : x.providerPublishTime,
      ).toISOString(),
      thumb: x.thumbnail?.resolutions?.find((t: Any) => t.width < 300)?.url ?? x.thumbnail?.resolutions?.[0]?.url,
    }));
  });
  return data ?? [];
}

export type SearchHit = { symbol: string; name: string; exchange: string; type: string };
export async function searchYahoo(q: string): Promise<SearchHit[]> {
  const data = await cached<SearchHit[]>(`search:${q.toLowerCase()}`, 24 * 3600_000, async () => {
    const r = (await yf.search(q, { quotesCount: 10, newsCount: 0 }, loose)) as Any;
    return (r.quotes ?? [])
      .filter((x: Any) => x.symbol && ["EQUITY", "ETF", "MUTUALFUND", "INDEX"].includes(x.quoteType))
      .map((x: Any) => ({
        symbol: x.symbol,
        name: x.longname ?? x.shortname ?? x.symbol,
        exchange: x.exchDisp ?? x.exchange,
        type: x.quoteType,
      }));
  });
  return data ?? [];
}
