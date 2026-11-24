import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { getProvider, BankIdError } from "./provider";
import { qrData } from "./qr";
import { messageFor } from "./messages";

const ORDER_TTL_MS = 3 * 60 * 1000; // orders expire after ~3 minutes

export type SignPayload = { action: string; userId?: string } & Record<string, unknown>;

export async function startBankId(opts: {
  intent: "auth" | "sign";
  ip: string;
  userVisibleData?: string;
  personalNumber?: string;
  payload?: SignPayload;
}) {
  const p = getProvider();
  // Only one ongoing order per personal number (alreadyInProgress semantics): cancel older ones.
  if (opts.personalNumber) {
    const old = await db
      .select({ orderRef: schema.bankidOrders.orderRef })
      .from(schema.bankidOrders)
      .where(
        and(
          eq(schema.bankidOrders.requiredPersonalNumber, opts.personalNumber),
          eq(schema.bankidOrders.status, "pending"),
        ),
      );
    for (const o of old) await cancelBankId(o.orderRef, "cancelled");
  }
  const res =
    opts.intent === "auth"
      ? await p.auth({ endUserIp: opts.ip, userVisibleData: opts.userVisibleData, personalNumber: opts.personalNumber })
      : await p.sign({ endUserIp: opts.ip, userVisibleData: opts.userVisibleData ?? "", personalNumber: opts.personalNumber });

  await db.insert(schema.bankidOrders).values({
    orderRef: res.orderRef,
    intent: opts.intent,
    mode: p.mode,
    autoStartToken: res.autoStartToken,
    qrStartToken: res.qrStartToken,
    qrStartSecret: res.qrStartSecret,
    requiredPersonalNumber: opts.personalNumber ?? null,
    userVisibleData: opts.userVisibleData ?? null,
    payload: opts.payload ?? null,
    ip: opts.ip,
  });
  return { orderRef: res.orderRef, autoStartToken: res.autoStartToken, mode: p.mode };
}

export async function collectBankId(orderRef: string, opts: { qr: boolean }) {
  const [order] = await db.select().from(schema.bankidOrders).where(eq(schema.bankidOrders.orderRef, orderRef));
  if (!order) throw new BankIdError("notFound");

  let { status, hintCode } = order;

  if (status === "pending") {
    if (order.mode === "test") {
      const r = await getProvider().collect(orderRef);
      if (r) {
        status = r.status;
        hintCode = r.hintCode ?? (r.status === "complete" ? "" : hintCode);
        await db
          .update(schema.bankidOrders)
          .set({
            status,
            hintCode,
            completion: r.completionData ?? null,
            completedAt: r.status === "pending" ? null : new Date(),
          })
          .where(eq(schema.bankidOrders.orderRef, orderRef));
      }
    } else if (Date.now() - order.createdAt.getTime() > ORDER_TTL_MS) {
      status = "failed";
      hintCode = "expiredTransaction";
      await db
        .update(schema.bankidOrders)
        .set({ status, hintCode, completedAt: new Date() })
        .where(eq(schema.bankidOrders.orderRef, orderRef));
    }
  }

  return {
    status,
    hintCode,
    intent: order.intent,
    mode: order.mode,
    message: messageFor(status, hintCode, { qr: opts.qr, intent: order.intent }),
    qr: status === "pending" ? qrData(order.qrStartToken, order.qrStartSecret, order.createdAt) : null,
  };
}

export async function cancelBankId(orderRef: string, hint: "cancelled" | "userCancel" = "cancelled") {
  const [order] = await db.select().from(schema.bankidOrders).where(eq(schema.bankidOrders.orderRef, orderRef));
  if (!order || order.status !== "pending") return;
  if (order.mode === "test") await getProvider().cancel(orderRef);
  await db
    .update(schema.bankidOrders)
    .set({ status: "failed", hintCode: hint, completedAt: new Date() })
    .where(eq(schema.bankidOrders.orderRef, orderRef));
}

/**
 * Atomically consumes a completed order (one-time use). Returns the completion data
 * and the payload that was signed.
 */
export async function consumeBankId(orderRef: string, intent: "auth" | "sign") {
  const [row] = await db
    .update(schema.bankidOrders)
    .set({ consumedAt: new Date() })
    .where(
      and(
        eq(schema.bankidOrders.orderRef, orderRef),
        eq(schema.bankidOrders.status, "complete"),
        eq(schema.bankidOrders.intent, intent),
        isNull(schema.bankidOrders.consumedAt),
      ),
    )
    .returning();
  if (!row || !row.completion) return null;
  return { completion: row.completion, payload: row.payload as SignPayload | null, userVisibleData: row.userVisibleData };
}
