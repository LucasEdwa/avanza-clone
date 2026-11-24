import { and, eq, inArray, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Instrument, Quote } from "@/db/schema";
import { liveQuotes } from "./live";

export type Row = Instrument & { quote: Quote | undefined; owners: number };

export async function listInstruments(types: Instrument["type"][], where?: SQL): Promise<Row[]> {
  const rows = await db
    .select()
    .from(schema.instruments)
    .where(and(inArray(schema.instruments.type, types), where));
  const quotes = await liveQuotes(rows);
  const owners = await db
    .select({ id: schema.holdings.instrumentId, c: sql<number>`count(distinct ${schema.accounts.userId})::int` })
    .from(schema.holdings)
    .innerJoin(schema.accounts, eq(schema.accounts.id, schema.holdings.accountId))
    .groupBy(schema.holdings.instrumentId);
  const om = new Map(owners.map((o) => [o.id, o.c]));
  return rows.map((r) => ({ ...r, quote: quotes.get(r.id), owners: om.get(r.id) ?? 0 }));
}
