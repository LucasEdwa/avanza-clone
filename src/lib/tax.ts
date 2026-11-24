import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { db, schema } from "@/db";
import { getHistory } from "@/lib/portfolio";

import { TAX_PARAMS, schablonRate } from "./tax-rate";
export { TAX_PARAMS, schablonRate };

export async function iskTax(userId: string, year = new Date().getFullYear()) {
  const accs = await db.select().from(schema.accounts).where(and(eq(schema.accounts.userId, userId), inArray(schema.accounts.type, ["ISK", "KF"])));
  if (!accs.length) return null;
  const ids = accs.map((a) => a.id);
  const history = await getHistory(userId, ids);
  const currentValue = history[history.length - 1]?.value ?? 0;
  const valueAt = (d: string) => {
    const t = Date.parse(d + "T00:00:00Z") / 1000;
    if (t > Date.now() / 1000) return { value: currentValue, estimated: true };
    let v = 0;
    for (const p of history) if (p.t <= t) v = p.value;
    return { value: v, estimated: false };
  };
  const quarters = ["01-01", "04-01", "07-01", "10-01"].map((md, i) => ({ label: `Q${i + 1} (${year}-${md})`, ...valueAt(`${year}-${md}`) }));
  const deposits = await db
    .select({ amount: schema.transactions.amount })
    .from(schema.transactions)
    .where(
      and(
        inArray(schema.transactions.accountId, ids),
        inArray(schema.transactions.type, ["DEPOSIT", "TRANSFER_IN"]),
        gte(schema.transactions.bookedAt, new Date(`${year}-01-01T00:00:00Z`)),
        lt(schema.transactions.bookedAt, new Date(`${year + 1}-01-01T00:00:00Z`)),
      ),
    );
  const depositSum = deposits.reduce((s, d) => s + d.amount, 0);
  const capitalBase = (quarters.reduce((s, q) => s + q.value, 0) + depositSum) / 4;
  const p = TAX_PARAMS[year] ?? TAX_PARAMS[2026];
  const taxable = Math.max(0, capitalBase - p.taxFree);
  const rate = schablonRate(year);
  const income = (taxable * rate) / 100;
  return { year, quarters, depositSum, capitalBase, taxFree: p.taxFree, taxable, rate, income, tax: income * 0.3, estimatedParams: p.estimated };
}

export async function realizedGains(userId: string) {
  const accs = await db.select().from(schema.accounts).where(and(eq(schema.accounts.userId, userId), eq(schema.accounts.type, "AF")));
  if (!accs.length) return [];
  const rows = await db
    .select({ t: schema.transactions, i: schema.instruments })
    .from(schema.transactions)
    .innerJoin(schema.instruments, eq(schema.instruments.id, schema.transactions.instrumentId))
    .where(and(inArray(schema.transactions.accountId, accs.map((a) => a.id)), eq(schema.transactions.type, "SELL")));
  const byYear = new Map<number, typeof rows>();
  for (const r of rows) {
    const y = r.t.bookedAt.getFullYear();
    byYear.set(y, [...(byYear.get(y) ?? []), r]);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, list]) => {
      const gains = list.reduce((s, r) => s + Math.max(0, r.t.realizedGain ?? 0), 0);
      const losses = list.reduce((s, r) => s + Math.min(0, r.t.realizedGain ?? 0), 0);
      const net = gains + losses;
      return { year, list, gains, losses, net, tax: net > 0 ? net * 0.3 : net * 0.7 * 0.3 };
    });
}
