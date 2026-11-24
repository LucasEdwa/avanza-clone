import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { createSession } from "@/lib/auth";
import { consumeBankId } from "@/lib/bankid/service";
import { ONBOARDING_COOKIE, sign } from "@/lib/signed-cookie";

/** Completes a BankID login: creates a session, or starts onboarding for new customers. */
export async function POST(req: Request) {
  const { orderRef, next } = await req.json();
  const res = await consumeBankId(orderRef, "auth");
  if (!res) return NextResponse.json({ error: "Identifieringen kunde inte verifieras." }, { status: 400 });
  const { personalNumber, givenName, surname } = res.completion.user;
  const [user] = await db.select().from(schema.users).where(eq(schema.users.personalNumber, personalNumber));
  if (!user) {
    (await cookies()).set(ONBOARDING_COOKIE, sign({ pnr: personalNumber, givenName, surname }, 30 * 60), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 60,
    });
    return NextResponse.json({ redirect: "/bli-kund" });
  }
  await createSession(user.id, "BankID");
  const safeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/min-ekonomi/oversikt";
  return NextResponse.json({ redirect: safeNext });
}
