import { inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { getPerfMany } from "@/lib/market/performance";

export async function warmPerformance() {
  const rows = await db.select({ symbol: schema.instruments.symbol }).from(schema.instruments).where(inArray(schema.instruments.type, ["STOCK", "FUND", "ETF"]));
  await getPerfMany(rows.map((r) => r.symbol), 4);
}
