import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, schema } from "@/db";

export const SESSION_COOKIE = "spira_session";
const IDLE_MIN = Number(process.env.SESSION_IDLE_MINUTES ?? 30);

const hash = (t: string) => createHash("sha256").update(t).digest("hex");

export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || h.get("x-real-ip") || "127.0.0.1";
  return ip === "::1" ? "127.0.0.1" : ip.replace(/^::ffff:/, "");
}

export async function createSession(userId: string, method: string) {
  const token = randomBytes(32).toString("base64url");
  const h = await headers();
  const ip = await clientIp();
  const ua = h.get("user-agent") ?? null;
  await db.insert(schema.sessions).values({
    id: hash(token),
    userId,
    expiresAt: new Date(Date.now() + IDLE_MIN * 60_000),
    ip,
    userAgent: ua,
  });
  await db.insert(schema.loginEvents).values({ userId, method, ip, userAgent: ua });
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, userId));
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  // housekeeping
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
}

export const getSession = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const id = hash(token);
  const [row] = await db
    .select({ session: schema.sessions, user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.id, id), gt(schema.sessions.expiresAt, new Date())));
  if (!row) return null;
  // Sliding inactivity timeout
  if (Date.now() - row.session.lastSeenAt.getTime() > 30_000) {
    await db
      .update(schema.sessions)
      .set({ lastSeenAt: new Date(), expiresAt: new Date(Date.now() + IDLE_MIN * 60_000) })
      .where(eq(schema.sessions.id, id));
  }
  return { sessionId: id, user: row.user, expiresAt: row.session.expiresAt };
});

export async function getUser() {
  return (await getSession())?.user ?? null;
}

export async function requireUser() {
  const s = await getSession();
  if (!s) redirect("/logga-in?utloggad=1");
  return s.user;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.id, hash(token)));
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string) {
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
  (await cookies()).delete(SESSION_COOKIE);
}
