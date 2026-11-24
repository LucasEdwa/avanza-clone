"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { cancelOrder, modifyOrder, OrderError, placeOrder, type PlaceOrderInput } from "@/lib/trading/engine";
import { num, price, sek } from "@/lib/format";

type Result = { ok?: boolean; error?: string; message?: string; status?: string };

export async function placeOrderAction(input: Omit<PlaceOrderInput, "userId" | "source">): Promise<Result> {
  const user = await requireUser();
  try {
    const o = await placeOrder({ ...input, userId: user.id, source: "manual" });
    revalidatePath("/", "layout");
    if (o.status === "FILLED")
      return {
        ok: true,
        status: o.status,
        message: `Ordern är utförd: ${num(o.filledQuantity, 0, 4)} st à ${price(o.fillPrice)}${o.courtage ? `, courtage ${sek(o.courtage)}` : ""}.`,
      };
    if (o.type === "FUND")
      return { ok: true, status: o.status, message: "Fondordern är lagd och genomförs till nästa fastställda NAV-kurs." };
    return { ok: true, status: o.status, message: "Ordern är lagd och ligger i orderboken." };
  } catch (e) {
    if (e instanceof OrderError) return { error: e.message };
    console.error(e);
    return { error: "Ordern kunde inte läggas. Försök igen." };
  }
}

export async function cancelOrderAction(orderId: string): Promise<Result> {
  const user = await requireUser();
  try {
    await cancelOrder(user.id, orderId);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function modifyOrderAction(orderId: string, changes: { quantity?: number; limitPrice?: number; validUntil?: string }): Promise<Result> {
  const user = await requireUser();
  try {
    await modifyOrder(user.id, orderId, changes);
    revalidatePath("/", "layout");
    return { ok: true, message: "Ordern är ändrad." };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
