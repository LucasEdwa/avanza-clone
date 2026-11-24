import { and, eq, inArray, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Instrument, Quote } from "@/db/schema";
import { liveQuotes } from "./live";
import { getPerfMany, type Perf } from "./performance";

export type Row = Instrument & { quote: Quote | undefined; owners: number; perf?: Perf; buys24h?: number };

export async function listInstruments(types: Instrument["type"][], where?: SQL, opts: { perf?: boolean } = {}): Promise<Row[]> {
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
  const buys = await db
    .select({ id: schema.orders.instrumentId, c: sql<number>`count(*)::int` })
    .from(schema.orders)
    .where(and(eq(schema.orders.side, "BUY"), sql`${schema.orders.createdAt} > now() - interval '24 hours'`))
    .groupBy(schema.orders.instrumentId);
  const bm = new Map(buys.map((b) => [b.id, b.c]));
  const perf = opts.perf ? await getPerfMany(rows.map((r) => r.symbol)) : null;
  return rows.map((r) => ({ ...r, quote: quotes.get(r.id), owners: om.get(r.id) ?? 0, buys24h: bm.get(r.id) ?? 0, perf: perf?.get(r.symbol) }));
}
