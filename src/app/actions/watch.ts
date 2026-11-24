"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";

type R = { ok?: boolean; error?: string };

async function ownList(userId: string, id: string) {
  const [w] = await db.select().from(schema.watchlists).where(and(eq(schema.watchlists.id, id), eq(schema.watchlists.userId, userId)));
  return w;
}

export async function toggleWatch(watchlistId: string, instrumentId: number, on: boolean): Promise<R> {
  const user = await requireUser();
  if (!(await ownList(user.id, watchlistId))) return { error: "Listan finns inte" };
  if (on) await db.insert(schema.watchlistItems).values({ watchlistId, instrumentId }).onConflictDoNothing();
  else await db.delete(schema.watchlistItems).where(and(eq(schema.watchlistItems.watchlistId, watchlistId), eq(schema.watchlistItems.instrumentId, instrumentId)));
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createWatchlist(name: string): Promise<R & { id?: string }> {
  const user = await requireUser();
  const n = name.trim().slice(0, 40);
  if (!n) return { error: "Ange ett namn" };
  const [w] = await db.insert(schema.watchlists).values({ userId: user.id, name: n }).returning();
  revalidatePath("/bevakningar");
  return { ok: true, id: w.id };
}

export async function renameWatchlist(id: string, name: string): Promise<R> {
  const user = await requireUser();
  await db.update(schema.watchlists).set({ name: name.trim().slice(0, 40) }).where(and(eq(schema.watchlists.id, id), eq(schema.watchlists.userId, user.id)));
  revalidatePath("/bevakningar");
  return { ok: true };
}

export async function deleteWatchlist(id: string): Promise<R> {
  const user = await requireUser();
  await db.delete(schema.watchlists).where(and(eq(schema.watchlists.id, id), eq(schema.watchlists.userId, user.id)));
  revalidatePath("/bevakningar");
  return { ok: true };
}

export async function createAlert(instrumentId: number, direction: "ABOVE" | "BELOW", price: number): Promise<R> {
  const user = await requireUser();
  if (!(price > 0)) return { error: "Ange en kurs" };
  await db.insert(schema.priceAlerts).values({ userId: user.id, instrumentId, direction, price });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteAlert(id: string): Promise<R> {
  const user = await requireUser();
  await db.delete(schema.priceAlerts).where(and(eq(schema.priceAlerts.id, id), eq(schema.priceAlerts.userId, user.id)));
  revalidatePath("/", "layout");
  return { ok: true };
}
