import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { fetchYahooQuotes, mapYahooQuote } from "@/lib/market/quotes";
import { isMarketOpen, nextTradingDay, stockholmDate, stockholmTime, venueForSymbol } from "@/lib/market-hours";

const TYPE_MAP: Record<string, "STOCK" | "ETF" | "FUND" | "INDEX" | "CURRENCY" | "CRYPTO"> = {
  EQUITY: "STOCK",
  ETF: "ETF",
  MUTUALFUND: "FUND",
  INDEX: "INDEX",
  CURRENCY: "CURRENCY",
  CRYPTOCURRENCY: "CRYPTO",
};

/** Look up an instrument; if unknown, discover it from Yahoo and add it to the catalog. */
export async function getInstrument(symbolRaw: string) {
  const symbol = decodeURIComponent(symbolRaw).toUpperCase();
  const [i] = await db.select().from(schema.instruments).where(eq(schema.instruments.symbol, symbol));
  if (i) return i;
  if (!/^[A-Z0-9.^=\-]{1,20}$/.test(symbol)) return null;
  const [q] = (await fetchYahooQuotes([symbol])) as Record<string, unknown>[];
  if (!q || typeof q.regularMarketPrice !== "number") return null;
  const type = TYPE_MAP[String(q.quoteType)] ?? null;
  if (!type) return null;
  const supportedCurrency = ["SEK", "USD", "EUR", "NOK", "DKK"].includes(String(q.currency));
  const [created] = await db
    .insert(schema.instruments)
    .values({
      symbol,
      ticker: symbol.replace(/\.(ST|CO|OL|DE|HE)$/, "").replace(/-/g, " "),
      name: String(q.longName ?? q.shortName ?? symbol),
      type,
      currency: String(q.currency ?? "SEK"),
      exchange: String(q.fullExchangeName ?? q.exchange ?? ""),
      country: symbol.endsWith(".ST") ? "SE" : symbol.endsWith(".CO") ? "DK" : symbol.endsWith(".OL") ? "NO" : symbol.includes(".") ? null : "US",
      segment: symbol.endsWith(".ST") ? "First North/Övrigt" : null,
      tradable: ["STOCK", "ETF", "FUND"].includes(type) && supportedCurrency,
      minInvestment: type === "FUND" ? 100 : null,
    })
    .onConflictDoNothing()
    .returning();
  if (!created) return (await db.select().from(schema.instruments).where(eq(schema.instruments.symbol, symbol)))[0] ?? null;
  await db
    .insert(schema.quotes)
    .values({ instrumentId: created.id, ...mapYahooQuote(q as never), updatedAt: new Date() })
    .onConflictDoNothing();
  return created;
}

export async function ownersCount(instrumentId: number) {
  const [r] = await db
    .select({ c: sql<number>`count(distinct ${schema.accounts.userId})::int` })
    .from(schema.holdings)
    .innerJoin(schema.accounts, eq(schema.accounts.id, schema.holdings.accountId))
    .where(eq(schema.holdings.instrumentId, instrumentId));
  return r.c;
}

export async function myPositions(userId: string, instrumentId: number) {
  return db
    .select({ h: schema.holdings, a: schema.accounts })
    .from(schema.holdings)
    .innerJoin(schema.accounts, eq(schema.accounts.id, schema.holdings.accountId))
    .where(and(eq(schema.accounts.userId, userId), eq(schema.holdings.instrumentId, instrumentId)));
}

/** Default "giltig t.o.m.": today while the market is open (or before it opens), otherwise the next trading day. */
export function defaultValidity(symbol: string) {
  const venue = venueForSymbol(symbol);
  const today = stockholmDate();
  if (venue !== "STO") return isMarketOpen(venue) ? today : nextTradingDay(today, venue === "US" ? "US" : "STO");
  const closeToday = stockholmTime(today, 17, 30);
  return new Date() < closeToday && isTradingDayStr(today) ? today : nextTradingDay(today);
}
function isTradingDayStr(d: string) {
  const wd = new Date(`${d}T12:00:00Z`).getUTCDay();
  return wd !== 0 && wd !== 6;
}
