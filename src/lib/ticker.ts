import { eq, inArray, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { refreshQuotes } from "@/lib/market/quotes";
import { checkAlerts, creditInterest, expireStaleBankId, matchOrders, runMonthlySavings } from "@/lib/trading/engine";

let running = false;

export async function runTick() {
  if (running) return { skipped: true };
  running = true;
  const t0 = Date.now();
  try {
    const active = await db
      .selectDistinct({ id: schema.instruments.id, symbol: schema.instruments.symbol })
      .from(schema.instruments)
      .leftJoin(schema.orders, eq(schema.orders.instrumentId, schema.instruments.id))
      .leftJoin(schema.priceAlerts, eq(schema.priceAlerts.instrumentId, schema.instruments.id))
      .where(or(eq(schema.orders.status, "ACTIVE"), eq(schema.priceAlerts.active, true)));
    const fx = await db
      .select({ id: schema.instruments.id, symbol: schema.instruments.symbol })
      .from(schema.instruments)
      .where(inArray(schema.instruments.type, ["CURRENCY"]));
    const { refreshed } = await refreshQuotes([...active, ...fx]);
    const filled = await matchOrders();
    await checkAlerts(refreshed);
    const savings = await runMonthlySavings();
    await creditInterest();
    await expireStaleBankId();
    return { refreshed: refreshed.length, filled, savings, ms: Date.now() - t0 };
  } finally {
    running = false;
  }
}
