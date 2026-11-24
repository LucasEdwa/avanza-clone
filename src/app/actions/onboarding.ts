"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { createSession } from "@/lib/auth";
import { verifySignature } from "@/lib/bankid/sign-actions";
import { getOnboarding, ONBOARDING_COOKIE } from "@/lib/signed-cookie";
import { validateKyc } from "@/lib/kyc";
import { newAccountNumber } from "@/lib/accounts";

const Data = z.object({
  email: z.string().email("Ange en giltig e-postadress"),
  phone: z.string().regex(/^[0-9 +\-]{7,20}$/, "Ange ett giltigt telefonnummer"),
  street: z.string().min(2, "Ange gatuadress"),
  postalCode: z.string().regex(/^\d{3}\s?\d{2}$/, "Postnummer ska vara 5 siffror"),
  city: z.string().min(2, "Ange ort"),
  accountType: z.enum(["ISK", "KF", "AF"]),
  kyc: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export async function completeOnboarding(orderRef: string, raw: unknown): Promise<{ error?: string; redirect?: string }> {
  const ob = await getOnboarding();
  if (!ob) return { error: "Sessionen har gått ut. Börja om genom att logga in med BankID." };
  const parsed = Data.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const kycErr = validateKyc(parsed.data.kyc);
  if (kycErr) return { error: kycErr };
  try {
    await verifySignature(orderRef, { action: "agreement" }, { pnr: ob.pnr });
  } catch (e) {
    return { error: (e as Error).message };
  }
  const [exists] = await db.select().from(schema.users).where(eq(schema.users.personalNumber, ob.pnr));
  if (exists) return { error: "Du är redan kund. Logga in istället." };

  const d = parsed.data;
  const user = await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(schema.users)
      .values({
        personalNumber: ob.pnr,
        firstName: ob.givenName,
        lastName: ob.surname,
        email: d.email,
        phone: d.phone,
        street: d.street,
        postalCode: d.postalCode.replace(/\s/g, ""),
        city: d.city,
        courtageClass: "START",
        termsSignedAt: new Date(),
        kycCompletedAt: new Date(),
        kyc: d.kyc,
      })
      .returning();
    const name = { ISK: "ISK", KF: "Kapitalförsäkring", AF: "Aktie- & fondkonto" }[d.accountType];
    await tx.insert(schema.accounts).values({ userId: u.id, type: d.accountType, name, accountNumber: await newAccountNumber(tx) });
    await tx.insert(schema.watchlists).values({ userId: u.id, name: "Min bevakningslista" });
    await tx.insert(schema.notifications).values({
      userId: u.id,
      kind: "info",
      title: `Välkommen till Spira, ${u.firstName}!`,
      body: "Gör din första insättning för att komma igång. Som ny kund handlar du för 0 kr i courtage upp till 50 000 kr.",
      link: "/min-ekonomi/insattning",
    });
    return u;
  });
  (await cookies()).delete(ONBOARDING_COOKIE);
  await createSession(user.id, "BankID");
  return { redirect: "/min-ekonomi/oversikt?valkommen=1" };
}
