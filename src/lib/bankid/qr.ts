import { createHmac } from "node:crypto";

/**
 * Animated QR code data per the BankID RP API v6:
 *   "bankid." + qrStartToken + "." + seconds + "." + HMAC-SHA256(qrStartSecret, seconds)
 * where `seconds` = whole seconds since the order was created.
 */
export function qrAuthCode(qrStartSecret: string, seconds: number): string {
  return createHmac("sha256", qrStartSecret).update(String(seconds)).digest("hex");
}

export function qrData(qrStartToken: string, qrStartSecret: string, createdAt: Date, now = new Date()): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - createdAt.getTime()) / 1000));
  return `bankid.${qrStartToken}.${seconds}.${qrAuthCode(qrStartSecret, seconds)}`;
}

export function parseQrData(data: string): { qrStartToken: string; seconds: number; code: string } | null {
  const m = data.trim().match(/^bankid\.([0-9a-f-]{36})\.(\d+)\.([0-9a-f]{64})$/i);
  if (!m) return null;
  return { qrStartToken: m[1], seconds: Number(m[2]), code: m[3] };
}
