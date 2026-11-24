import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const secret = () => process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";

export function sign(data: object, ttlSec: number): string {
  const body = Buffer.from(JSON.stringify({ ...data, exp: Date.now() + ttlSec * 1000 })).toString("base64url");
  const mac = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verify<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const data = JSON.parse(Buffer.from(body, "base64url").toString());
  if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
  return data as T;
}

export type Onboarding = { pnr: string; givenName: string; surname: string };
export const ONBOARDING_COOKIE = "spira_onboarding";

export async function getOnboarding() {
  return verify<Onboarding>((await cookies()).get(ONBOARDING_COOKIE)?.value);
}
