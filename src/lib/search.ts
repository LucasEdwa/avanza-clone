import { ilike, or, sql, inArray } from "drizzle-orm";
import { db, schema } from "@/db";

export async function searchInstruments(q: string, limit = 8) {
  const term = q.trim();
  if (!term) return [];
  const like = `%${term.replace(/[%_]/g, "")}%`;
  const rows = await db
    .select()
    .from(schema.instruments)
    .where(or(ilike(schema.instruments.name, like), ilike(schema.instruments.ticker, like), ilike(schema.instruments.symbol, like)))
    .orderBy(
      sql`case when lower(${schema.instruments.ticker}) = lower(${term}) then 0 when ${schema.instruments.ticker} ilike ${term + "%"} then 1 when ${schema.instruments.name} ilike ${term + "%"} then 2 else 3 end`,
      sql`case ${schema.instruments.type} when 'STOCK' then 0 when 'FUND' then 1 when 'ETF' then 2 else 3 end`,
      schema.instruments.name,
    )
    .limit(limit);
  const quotes = rows.length
    ? await db
        .select()
        .from(schema.quotes)
        .where(
          inArray(
            schema.quotes.instrumentId,
            rows.map((r) => r.id),
          ),
        )
    : [];
  const qm = new Map(quotes.map((x) => [x.instrumentId, x]));
  return rows.map((r) => ({ ...r, quote: qm.get(r.id) ?? null }));
}
