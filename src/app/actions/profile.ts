"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { validateKyc } from "@/lib/kyc";

const Contact = z.object({
  email: z.string().email("Ogiltig e-post"),
  phone: z.string().regex(/^[0-9 +\-]{7,20}$/, "Ogiltigt telefonnummer"),
  street: z.string().min(2),
  postalCode: z.string().regex(/^\d{3}\s?\d{2}$/, "Postnummer ska vara 5 siffror"),
  city: z.string().min(2),
});

export async function updateContact(raw: unknown) {
  const user = await requireUser();
  const p = Contact.safeParse(raw);
  if (!p.success) return { error: p.error.issues[0].message };
  await db.update(schema.users).set({ ...p.data, postalCode: p.data.postalCode.replace(/\s/g, "") }).where(eq(schema.users.id, user.id));
  revalidatePath("/profil");
  return { ok: true };
}

export async function setCourtageClass(cls: "START" | "MINI" | "SMALL" | "MEDIUM" | "FAST_PRIS") {
  const user = await requireUser();
  if (!["MINI", "SMALL", "MEDIUM", "FAST_PRIS", "START"].includes(cls)) return { error: "Ogiltig klass" };
  if (cls === "START" && user.courtageClass !== "START") return { error: "Start-klassen gäller bara för nya kunder." };
  await db.update(schema.users).set({ courtageClass: cls }).where(eq(schema.users.id, user.id));
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setTheme(theme: "light" | "dark" | "system") {
  const user = await requireUser();
  await db.update(schema.users).set({ theme }).where(eq(schema.users.id, user.id));
  (await cookies()).set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}

export async function updateKyc(answers: Record<string, string | string[]>) {
  const user = await requireUser();
  const err = validateKyc(answers);
  if (err) return { error: err };
  await db.update(schema.users).set({ kyc: answers, kycCompletedAt: new Date() }).where(eq(schema.users.id, user.id));
  revalidatePath("/profil");
  return { ok: true };
}
