"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { runMonthlySavings } from "@/lib/trading/engine";

const Plan = z.object({
  accountId: z.string().uuid(),
  bankAccountId: z.string().uuid(),
  amount: z.number().min(100, "Lägsta belopp är 100 kr").max(100000),
  dayOfMonth: z.number().int().min(1).max(28),
  allocations: z.array(z.object({ instrumentId: z.number().int(), pct: z.number().min(1).max(100) })).min(1, "Välj minst en fond"),
});

export async function createPlan(raw: unknown): Promise<{ ok?: boolean; error?: string }> {
  const user = await requireUser();
  const p = Plan.safeParse(raw);
  if (!p.success) return { error: p.error.issues[0].message };
  const d = p.data;
  if (Math.round(d.allocations.reduce((s, a) => s + a.pct, 0)) !== 100) return { error: "Fördelningen måste bli 100 %." };
  if (d.allocations.some((a) => (d.amount * a.pct) / 100 < 100)) return { error: "Varje fond måste få minst 100 kr per månad." };
  const [acc] = await db.select().from(schema.accounts).where(and(eq(schema.accounts.id, d.accountId), eq(schema.accounts.userId, user.id)));
  const [bank] = await db.select().from(schema.bankAccounts).where(and(eq(schema.bankAccounts.id, d.bankAccountId), eq(schema.bankAccounts.userId, user.id)));
  if (!acc || !bank || acc.type === "SPARKONTO") return { error: "Ogiltigt konto." };
  const funds = await db.select().from(schema.instruments).where(inArray(schema.instruments.id, d.allocations.map((a) => a.instrumentId)));
  if (funds.length !== d.allocations.length || funds.some((f) => f.type !== "FUND")) return { error: "Månadssparande kan bara ske i fonder." };
  await db.insert(schema.monthlySavings).values({ userId: user.id, ...d });
  revalidatePath("/min-ekonomi/manadsspara");
  return { ok: true };
}

export async function setPlanActive(id: string, active: boolean) {
  const user = await requireUser();
  await db.update(schema.monthlySavings).set({ active }).where(and(eq(schema.monthlySavings.id, id), eq(schema.monthlySavings.userId, user.id)));
  revalidatePath("/min-ekonomi/manadsspara");
}

export async function deletePlan(id: string) {
  const user = await requireUser();
  await db.delete(schema.monthlySavings).where(and(eq(schema.monthlySavings.id, id), eq(schema.monthlySavings.userId, user.id)));
  revalidatePath("/min-ekonomi/manadsspara");
}

/** Demo helper: run a plan immediately instead of waiting for its day of month. */
export async function runPlanNow(id: string) {
  const user = await requireUser();
  const [p] = await db.select().from(schema.monthlySavings).where(and(eq(schema.monthlySavings.id, id), eq(schema.monthlySavings.userId, user.id)));
  if (!p) return;
  await runMonthlySavings({ planId: id, force: true });
  revalidatePath("/", "layout");
}
