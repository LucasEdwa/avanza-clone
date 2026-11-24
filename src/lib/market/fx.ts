import { inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { refreshQuotes } from "./quotes";

export const FX_SYMBOLS: Record<string, string> = {
  USD: "USDSEK=X",
  EUR: "EURSEK=X",
  NOK: "NOKSEK=X",
  DKK: "DKKSEK=X",
};

export type FxRates = Record<string, number>;

/** Returns SEK per unit of currency, e.g. {SEK:1, USD:10.5, ...}. */
export async function getFxRates(): Promise<FxRates> {
  const rows = await db
    .select({ id: schema.instruments.id, symbol: schema.instruments.symbol })
    .from(schema.instruments)
    .where(inArray(schema.instruments.symbol, Object.values(FX_SYMBOLS)));
  const { quotes } = await refreshQuotes(rows);
  const rates: FxRates = { SEK: 1 };
  for (const [cur, sym] of Object.entries(FX_SYMBOLS)) {
    const r = rows.find((x) => x.symbol === sym);
    const q = r && quotes.get(r.id);
    if (q?.last) rates[cur] = q.last;
  }
  return rates;
}

export function toSek(value: number, currency: string, fx: FxRates): number {
  return value * (fx[currency] ?? 1);
}
