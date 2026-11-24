import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { buyingPower } from "@/lib/trading/engine";

export async function moneyData(userId: string) {
  const accounts = await db
    .select()
    .from(schema.accounts)
    .where(and(eq(schema.accounts.userId, userId), isNull(schema.accounts.closedAt)))
    .orderBy(schema.accounts.createdAt);
  const banks = await db.select().from(schema.bankAccounts).where(eq(schema.bankAccounts.userId, userId));
  const withBp = await Promise.all(accounts.map(async (a) => ({ id: a.id, name: a.name, number: a.accountNumber, type: a.type, cash: a.cash, buyingPower: await buyingPower(a.id) })));
  return { accounts: withBp, banks: banks.map((b) => ({ id: b.id, label: `${b.bankName} ${b.clearing}-${b.accountNumber}` })) };
}
export type MoneyData = Awaited<ReturnType<typeof moneyData>>;
