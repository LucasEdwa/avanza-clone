"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { verifySignature, type SignRequest } from "@/lib/bankid/sign-actions";
import { buyingPower } from "@/lib/trading/engine";
import { newAccountNumber } from "@/lib/accounts";
import { sek } from "@/lib/format";
import { stockholmDate } from "@/lib/market-hours";
import { ACCOUNT_TYPE_LABEL } from "@/lib/utils";

type Result = { ok?: boolean; error?: string; message?: string };
const round2 = (n: number) => Math.round(n * 100) / 100;

async function ownAccount(userId: string, accountId: string) {
  const [a] = await db
    .select()
    .from(schema.accounts)
    .where(and(eq(schema.accounts.id, accountId), eq(schema.accounts.userId, userId), isNull(schema.accounts.closedAt)));
  return a;
}

export async function deposit(accountId: string, bankAccountId: string, amountRaw: number): Promise<Result> {
  const user = await requireUser();
  const amount = round2(Number(amountRaw));
  if (!(amount >= 1) || amount > 1_000_000) return { error: "Belopp måste vara mellan 1 kr och 1 000 000 kr." };
  const acc = await ownAccount(user.id, accountId);
  const [bank] = await db.select().from(schema.bankAccounts).where(and(eq(schema.bankAccounts.id, bankAccountId), eq(schema.bankAccounts.userId, user.id)));
  if (!acc || !bank) return { error: "Ogiltigt konto." };
  await db.transaction(async (tx) => {
    await tx.update(schema.accounts).set({ cash: sql`${schema.accounts.cash} + ${amount}` }).where(eq(schema.accounts.id, acc.id));
    await tx.insert(schema.transactions).values({
      accountId: acc.id,
      type: "DEPOSIT",
      amount,
      description: `Insättning från ${bank.bankName} ${bank.clearing}-${bank.accountNumber}`,
      settleDate: stockholmDate(),
    });
    await tx.insert(schema.notifications).values({ userId: user.id, kind: "money", title: "Insättning genomförd", body: `${sek(amount)} har satts in på ${acc.name}.`, link: `/min-ekonomi/konton/${acc.id}` });
  });
  revalidatePath("/", "layout");
  return { ok: true, message: `${sek(amount)} har satts in på ${acc.name}. Pengarna är tillgängliga direkt.` };
}

export async function withdraw(orderRef: string, req: Extract<SignRequest, { action: "withdrawal" }>): Promise<Result> {
  const user = await requireUser();
  try {
    await verifySignature(orderRef, req, { userId: user.id, pnr: user.personalNumber });
  } catch (e) {
    return { error: (e as Error).message };
  }
  const amount = round2(req.amount);
  const acc = await ownAccount(user.id, req.accountId);
  const [bank] = await db.select().from(schema.bankAccounts).where(and(eq(schema.bankAccounts.id, req.bankAccountId), eq(schema.bankAccounts.userId, user.id)));
  if (!acc || !bank) return { error: "Ogiltigt konto." };
  try {
    await db.transaction(async (tx) => {
      await tx.select().from(schema.accounts).where(eq(schema.accounts.id, acc.id)).for("update");
      const bp = await buyingPower(acc.id, tx);
      if (amount > bp) throw new Error(`Beloppet överstiger tillgängligt belopp för uttag (${sek(bp)}).`);
      await tx.update(schema.accounts).set({ cash: sql`${schema.accounts.cash} - ${amount}` }).where(eq(schema.accounts.id, acc.id));
      await tx.insert(schema.transactions).values({
        accountId: acc.id,
        type: "WITHDRAWAL",
        amount: -amount,
        description: `Uttag till ${bank.bankName} ${bank.clearing}-${bank.accountNumber}`,
        settleDate: stockholmDate(),
      });
      await tx.insert(schema.notifications).values({ userId: user.id, kind: "money", title: "Uttag registrerat", body: `${sek(amount)} betalas ut till ${bank.bankName} inom 1–2 bankdagar.` });
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: `Uttaget på ${sek(amount)} är registrerat. Pengarna når ditt bankkonto inom 1–2 bankdagar.` };
}

export async function transfer(fromId: string, toId: string, amountRaw: number): Promise<Result> {
  const user = await requireUser();
  const amount = round2(Number(amountRaw));
  if (fromId === toId) return { error: "Välj två olika konton." };
  if (!(amount > 0)) return { error: "Ange ett belopp." };
  const from = await ownAccount(user.id, fromId);
  const to = await ownAccount(user.id, toId);
  if (!from || !to) return { error: "Ogiltigt konto." };
  try {
    await db.transaction(async (tx) => {
      await tx.select().from(schema.accounts).where(eq(schema.accounts.id, from.id)).for("update");
      const bp = await buyingPower(from.id, tx);
      if (amount > bp) throw new Error(`Det finns bara ${sek(bp)} tillgängligt på ${from.name}.`);
      await tx.update(schema.accounts).set({ cash: sql`${schema.accounts.cash} - ${amount}` }).where(eq(schema.accounts.id, from.id));
      await tx.update(schema.accounts).set({ cash: sql`${schema.accounts.cash} + ${amount}` }).where(eq(schema.accounts.id, to.id));
      await tx.insert(schema.transactions).values([
        { accountId: from.id, type: "TRANSFER_OUT", amount: -amount, description: `Överföring till ${to.name} (${to.accountNumber})`, settleDate: stockholmDate() },
        { accountId: to.id, type: "TRANSFER_IN", amount, description: `Överföring från ${from.name} (${from.accountNumber})`, settleDate: stockholmDate() },
      ]);
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: `${sek(amount)} har förts över från ${from.name} till ${to.name}.` };
}

export async function openAccount(orderRef: string, req: Extract<SignRequest, { action: "open-account" }>): Promise<Result & { id?: string }> {
  const user = await requireUser();
  try {
    await verifySignature(orderRef, req, { userId: user.id, pnr: user.personalNumber });
  } catch (e) {
    return { error: (e as Error).message };
  }
  const [a] = await db
    .insert(schema.accounts)
    .values({
      userId: user.id,
      type: req.type,
      name: ACCOUNT_TYPE_LABEL[req.type] === "Investeringssparkonto" ? "ISK" : ACCOUNT_TYPE_LABEL[req.type],
      accountNumber: await newAccountNumber(),
      interestRate: req.type === "SPARKONTO" ? 2.25 : null,
    })
    .returning();
  await db.insert(schema.notifications).values({ userId: user.id, kind: "info", title: "Nytt konto öppnat", body: `${ACCOUNT_TYPE_LABEL[req.type]} ${a.accountNumber} är redo att användas.`, link: `/min-ekonomi/konton/${a.id}` });
  revalidatePath("/", "layout");
  return { ok: true, id: a.id };
}

export async function renameAccount(accountId: string, name: string): Promise<Result> {
  const user = await requireUser();
  const n = name.trim().slice(0, 40);
  if (!n) return { error: "Ange ett namn." };
  await db.update(schema.accounts).set({ name: n }).where(and(eq(schema.accounts.id, accountId), eq(schema.accounts.userId, user.id)));
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addBankAccount(orderRef: string, req: Extract<SignRequest, { action: "add-bank-account" }>): Promise<Result> {
  const user = await requireUser();
  if (!/^\d{4,5}$/.test(req.clearing)) return { error: "Clearingnummer ska vara 4–5 siffror." };
  if (!/^\d{5,15}$/.test(req.accountNumber)) return { error: "Kontonumret ska vara 5–15 siffror." };
  try {
    await verifySignature(orderRef, req, { userId: user.id, pnr: user.personalNumber });
  } catch (e) {
    return { error: (e as Error).message };
  }
  await db.insert(schema.bankAccounts).values({ userId: user.id, bankName: req.bankName, clearing: req.clearing, accountNumber: req.accountNumber });
  revalidatePath("/", "layout");
  return { ok: true, message: "Bankkontot är kopplat." };
}

export async function removeBankAccount(id: string): Promise<Result> {
  const user = await requireUser();
  await db.delete(schema.bankAccounts).where(and(eq(schema.bankAccounts.id, id), eq(schema.bankAccounts.userId, user.id)));
  revalidatePath("/", "layout");
  return { ok: true };
}
