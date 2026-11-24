import { inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Instrument, Quote } from "@/db/schema";
import { refreshQuotes } from "./quotes";
import { checkAlerts, matchOrders } from "@/lib/trading/engine";

/**
 * Fetch fresh quotes (from Postgres cache or Yahoo) and, when anything was refreshed,
 * run the order matcher and price alerts for those instruments.
 */
export async function liveQuotes(list: Pick<Instrument, "id" | "symbol">[], force = false): Promise<Map<number, Quote>> {
  const { quotes, refreshed } = await refreshQuotes(list, force);
  if (refreshed.length) {
    await matchOrders({ instrumentIds: refreshed }).catch((e) => console.error("[match]", e));
    await checkAlerts(refreshed).catch((e) => console.error("[alerts]", e));
  }
  return quotes;
}

export async function liveQuotesByIds(ids: number[], force = false) {
  if (!ids.length) return new Map<number, Quote>();
  const list = await db
    .select({ id: schema.instruments.id, symbol: schema.instruments.symbol })
    .from(schema.instruments)
    .where(inArray(schema.instruments.id, ids));
  return liveQuotes(list, force);
}
