import { eq } from "drizzle-orm";
import { db, schema, type Tx } from "@/db";

export async function newAccountNumber(tx: Tx | typeof db = db): Promise<string> {
  for (;;) {
    const n = String(Math.floor(1000000 + Math.random() * 8999999));
    const [e] = await tx.select({ id: schema.accounts.id }).from(schema.accounts).where(eq(schema.accounts.accountNumber, n));
    if (!e) return n;
  }
}
