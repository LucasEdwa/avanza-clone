import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";
import { normalizePersonnummer } from "@/lib/personnummer";
import { parseQrData, qrAuthCode } from "./qr";

export function simulatorEnabled() {
  return (process.env.BANKID_MODE ?? "simulator") === "simulator";
}

export async function pendingOrders() {
  return db
    .select({
      orderRef: schema.bankidOrders.orderRef,
      intent: schema.bankidOrders.intent,
      hintCode: schema.bankidOrders.hintCode,
      createdAt: schema.bankidOrders.createdAt,
      requiredPersonalNumber: schema.bankidOrders.requiredPersonalNumber,
    })
    .from(schema.bankidOrders)
    .where(
      and(
        eq(schema.bankidOrders.status, "pending"),
        eq(schema.bankidOrders.mode, "simulator"),
        gt(schema.bankidOrders.createdAt, new Date(Date.now() - 180_000)),
      ),
    );
}

/** Resolve an order from an orderRef, an autostart token, or scanned QR data (verifying the HMAC). */
export async function resolveOrder(input: { orderRef?: string; autoStartToken?: string; qr?: string }) {
  if (input.qr) {
    const parsed = parseQrData(input.qr);
    if (!parsed) throw new Error("Ogiltig QR-kod.");
    const [o] = await db.select().from(schema.bankidOrders).where(eq(schema.bankidOrders.qrStartToken, parsed.qrStartToken));
    if (!o) throw new Error("Okänd QR-kod.");
    if (qrAuthCode(o.qrStartSecret, parsed.seconds) !== parsed.code) throw new Error("QR-koden är förfalskad.");
    const age = Math.floor((Date.now() - o.createdAt.getTime()) / 1000);
    if (Math.abs(age - parsed.seconds) > 30) throw new Error("QR-koden har gått ut. Läs av den nya koden.");
    return o;
  }
  const where = input.orderRef
    ? eq(schema.bankidOrders.orderRef, input.orderRef)
    : eq(schema.bankidOrders.autoStartToken, input.autoStartToken ?? "00000000-0000-0000-0000-000000000000");
  const [o] = await db.select().from(schema.bankidOrders).where(where);
  if (!o) throw new Error("Hittade ingen pågående begäran.");
  return o;
}

export async function simScan(orderRef: string, identity: { personalNumber: string; givenName: string; surname: string }) {
  const pnr = normalizePersonnummer(identity.personalNumber);
  if (!pnr) throw new Error("Ogiltigt personnummer.");
  const [o] = await db.select().from(schema.bankidOrders).where(eq(schema.bankidOrders.orderRef, orderRef));
  if (!o || o.status !== "pending") throw new Error("Begäran är inte längre aktiv.");
  if (o.requiredPersonalNumber && o.requiredPersonalNumber !== pnr) {
    throw new Error("Det finns inget BankID i appen som kan användas för den här begäran (fel personnummer).");
  }
  await db
    .update(schema.bankidOrders)
    .set({
      hintCode: "userSign",
      completion: {
        user: { personalNumber: pnr, givenName: identity.givenName, surname: identity.surname, name: `${identity.givenName} ${identity.surname}` },
      },
    })
    .where(eq(schema.bankidOrders.orderRef, orderRef));
  return { intent: o.intent, userVisibleData: o.userVisibleData };
}

export async function simConfirm(orderRef: string, securityCode: string) {
  if (!/^\d{6}$/.test(securityCode)) throw new Error("Säkerhetskoden ska bestå av 6 siffror.");
  const [o] = await db.select().from(schema.bankidOrders).where(eq(schema.bankidOrders.orderRef, orderRef));
  if (!o || o.status !== "pending" || o.hintCode !== "userSign" || !o.completion) throw new Error("Begäran är inte längre aktiv.");
  const sigXml = `<Signature><SignedInfo orderRef="${orderRef}"/><usrVisibleData>${Buffer.from(o.userVisibleData ?? "").toString("base64")}</usrVisibleData><SignatureValue>${randomBytes(64).toString("base64")}</SignatureValue></Signature>`;
  await db
    .update(schema.bankidOrders)
    .set({
      status: "complete",
      hintCode: "",
      completedAt: new Date(),
      completion: {
        ...o.completion,
        device: { ipAddress: o.ip ?? "127.0.0.1" },
        signature: Buffer.from(sigXml).toString("base64"),
        ocspResponse: createHash("sha256").update(orderRef).digest("base64"),
      },
    })
    .where(eq(schema.bankidOrders.orderRef, orderRef));
}

export async function simCancel(orderRef: string) {
  await db
    .update(schema.bankidOrders)
    .set({ status: "failed", hintCode: "userCancel", completedAt: new Date() })
    .where(and(eq(schema.bankidOrders.orderRef, orderRef), eq(schema.bankidOrders.status, "pending")));
}
