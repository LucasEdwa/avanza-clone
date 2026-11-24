import { inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Instrument, Quote } from "@/db/schema";
import { isMarketOpen, venueForSymbol } from "@/lib/market-hours";
import { yf } from "./yahoo";

const OPEN_TTL = 60_000;
const CLOSED_TTL = 15 * 60_000;
const inflight = new Map<string, Promise<void>>();

type YQ = Record<string, unknown> & { symbol: string };
const n = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const pos = (v: unknown): number | null => {
  const x = n(v);
  return x && x > 0 ? x : null;
};

export function mapYahooQuote(q: YQ) {
  const t = q.regularMarketTime;
  return {
    last: n(q.regularMarketPrice),
    change: n(q.regularMarketChange),
    changePct: n(q.regularMarketChangePercent),
    bid: pos(q.bid),
    ask: pos(q.ask),
    open: pos(q.regularMarketOpen),
    high: pos(q.regularMarketDayHigh),
    low: pos(q.regularMarketDayLow),
    prevClose: n(q.regularMarketPreviousClose),
    volume: n(q.regularMarketVolume),
    avgVolume: n(q.averageDailyVolume3Month),
    marketCap: n(q.marketCap),
    pe: n(q.trailingPE),
    forwardPe: n(q.forwardPE),
    eps: n(q.epsTrailingTwelveMonths),
    priceToBook: n(q.priceToBook),
    dividendYield: n(q.trailingAnnualDividendYield) != null ? n(q.trailingAnnualDividendYield)! * 100 : n(q.dividendYield),
    dividendRate: n(q.trailingAnnualDividendRate) ?? n(q.dividendRate),
    high52: n(q.fiftyTwoWeekHigh),
    low52: n(q.fiftyTwoWeekLow),
    sharesOutstanding: n(q.sharesOutstanding),
    marketState: typeof q.marketState === "string" ? q.marketState : null,
    marketTime: t instanceof Date ? t : typeof t === "number" ? new Date(t * 1000) : null,
    ytdReturn: n(q.ytdReturn),
  };
}

export async function fetchYahooQuotes(symbols: string[]): Promise<YQ[]> {
  const out: YQ[] = [];
  for (let i = 0; i < symbols.length; i += 50) {
    const chunk = symbols.slice(i, i + 50);
    try {
      const r = (await yf.quote(chunk, {}, { validateResult: false })) as unknown as YQ[] | YQ;
      out.push(...(Array.isArray(r) ? r : [r]));
    } catch (e) {
      console.warn("[quotes] fetch failed", chunk.length, (e as Error).message);
    }
  }
  return out;
}

function ttlFor(symbol: string) {
  if (symbol.endsWith("=X") || symbol.endsWith("-USD") || symbol.endsWith("=F")) return OPEN_TTL * 2;
  return isMarketOpen(venueForSymbol(symbol)) ? OPEN_TTL : CLOSED_TTL;
}

/**
 * Ensures quotes for the given instruments are fresh (refreshing stale ones from Yahoo)
 * and returns a map instrumentId → Quote. Returns the ids that were refreshed.
 */
export async function refreshQuotes(list: Pick<Instrument, "id" | "symbol">[], force = false) {
  if (list.length === 0) return { quotes: new Map<number, Quote>(), refreshed: [] as number[] };
  const ids = list.map((i) => i.id);
  const existing = await db.select().from(schema.quotes).where(inArray(schema.quotes.instrumentId, ids));
  const byId = new Map(existing.map((q) => [q.instrumentId, q]));
  const now = Date.now();
  const stale = list.filter((i) => {
    const q = byId.get(i.id);
    return force || !q || now - q.updatedAt.getTime() > ttlFor(i.symbol);
  });

  const refreshed: number[] = [];
  if (stale.length) {
    const key = stale
      .map((s) => s.symbol)
      .sort()
      .join(",");
    let p = inflight.get(key);
    if (!p) {
      p = (async () => {
        const res = await fetchYahooQuotes(stale.map((s) => s.symbol));
        const bySym = new Map(res.map((r) => [r.symbol, r]));
        const rows = stale
          .map((s) => {
            const q = bySym.get(s.symbol);
            return q ? { instrumentId: s.id, ...mapYahooQuote(q), updatedAt: new Date() } : null;
          })
          .filter((r): r is NonNullable<typeof r> => r != null && r.last != null);
        if (rows.length) {
          await db
            .insert(schema.quotes)
            .values(rows)
            .onConflictDoUpdate({
              target: schema.quotes.instrumentId,
              set: Object.fromEntries(
                Object.keys(rows[0])
                  .filter((k) => k !== "instrumentId")
                  .map((k) => [k, sql.raw(`excluded.${k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase())}`)]),
              ),
            });
          refreshed.push(...rows.map((r) => r.instrumentId));
        }
      })().finally(() => inflight.delete(key));
      inflight.set(key, p);
    }
    await p;
    const fresh = await db
      .select()
      .from(schema.quotes)
      .where(
        inArray(
          schema.quotes.instrumentId,
          stale.map((s) => s.id),
        ),
      );
    for (const q of fresh) byId.set(q.instrumentId, q);
  }
  return { quotes: byId, refreshed };
}
