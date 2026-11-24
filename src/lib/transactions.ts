import { and, desc, eq, gte, inArray, lte, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";

export type TxFilter = { accountId?: string; type?: string; from?: string; to?: string };

export async function listTransactions(userId: string, f: TxFilter, limit = 500) {
  const accs = await db.select().from(schema.accounts).where(eq(schema.accounts.userId, userId));
  const ids = f.accountId ? accs.filter((a) => a.id === f.accountId).map((a) => a.id) : accs.map((a) => a.id);
  if (!ids.length) return { rows: [], accounts: accs };
  const conds: SQL[] = [inArray(schema.transactions.accountId, ids)];
  if (f.type === "TRADES") conds.push(inArray(schema.transactions.type, ["BUY", "SELL"]));
  else if (f.type === "MONEY") conds.push(inArray(schema.transactions.type, ["DEPOSIT", "WITHDRAWAL", "TRANSFER_IN", "TRANSFER_OUT"]));
  else if (f.type === "OTHER") conds.push(inArray(schema.transactions.type, ["DIVIDEND", "INTEREST", "TAX", "FEE"]));
  if (f.from) conds.push(gte(schema.transactions.bookedAt, new Date(f.from + "T00:00:00")));
  if (f.to) conds.push(lte(schema.transactions.bookedAt, new Date(f.to + "T23:59:59")));
  const rows = await db
    .select({ t: schema.transactions, i: schema.instruments, a: schema.accounts })
    .from(schema.transactions)
    .innerJoin(schema.accounts, eq(schema.accounts.id, schema.transactions.accountId))
    .leftJoin(schema.instruments, eq(schema.instruments.id, schema.transactions.instrumentId))
    .where(and(...conds))
    .orderBy(desc(schema.transactions.bookedAt))
    .limit(limit);
  return { rows, accounts: accs };
}
