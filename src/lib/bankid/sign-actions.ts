import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { sek } from "@/lib/format";
import { ACCOUNT_TYPE_LABEL } from "@/lib/utils";
import { consumeBankId } from "./service";

export type SignRequest =
  | { action: "agreement" }
  | { action: "withdrawal"; accountId: string; bankAccountId: string; amount: number }
  | { action: "open-account"; type: "ISK" | "KF" | "AF" | "SPARKONTO" }
  | { action: "add-bank-account"; bankName: string; clearing: string; accountNumber: string }
  | { action: "close-account"; accountId: string };

/** Builds the text shown in the BankID app (simpleMarkdownV1) – always on the server. */
export async function buildSignText(req: SignRequest, userId: string | null): Promise<string> {
  switch (req.action) {
    case "agreement":
      return "# Kundavtal Spira\n\nJag godkänner Spiras allmänna villkor för depå, konto och handel med finansiella instrument. Jag intygar att uppgifterna jag lämnat i kundkännedomen är riktiga och fullständiga.";
    case "withdrawal": {
      const [acc] = await db
        .select()
        .from(schema.accounts)
        .where(and(eq(schema.accounts.id, req.accountId), eq(schema.accounts.userId, userId!)));
      const [bank] = await db
        .select()
        .from(schema.bankAccounts)
        .where(and(eq(schema.bankAccounts.id, req.bankAccountId), eq(schema.bankAccounts.userId, userId!)));
      if (!acc || !bank) throw new Error("Ogiltigt konto");
      return `# Uttag\n\nJag godkänner uttag av **${sek(req.amount)}** från *${acc.name} (${acc.accountNumber})* till *${bank.bankName} ${bank.clearing}-${bank.accountNumber}*.`;
    }
    case "open-account":
      return `# Öppna konto\n\nJag ansöker om att öppna ett **${ACCOUNT_TYPE_LABEL[req.type]}** hos Spira och godkänner villkoren för kontot.`;
    case "add-bank-account":
      return `# Koppla bankkonto\n\nJag intygar att bankkontot *${req.bankName} ${req.clearing}-${req.accountNumber}* tillhör mig och godkänner att det kopplas till mitt kundkonto hos Spira för in- och utbetalningar.`;
    case "close-account":
      return `# Avsluta konto\n\nJag begär att kontot avslutas.`;
  }
}

function sameRequest(a: Record<string, unknown>, b: Record<string, unknown>) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)].filter((k) => k !== "userId" && k !== "pnr"));
  for (const k of keys) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) return false;
  return true;
}

/**
 * Verifies that the BankID order was signed by this user for exactly this request,
 * and consumes it (one-time use).
 */
export async function verifySignature(orderRef: string, req: SignRequest, expected: { userId?: string; pnr: string }) {
  const res = await consumeBankId(orderRef, "sign");
  if (!res) throw new Error("Underskriften kunde inte verifieras. Försök igen.");
  const p = res.payload ?? { action: "" };
  if (p.action !== req.action) throw new Error("Underskriften gäller en annan åtgärd.");
  if (expected.userId && p.userId !== expected.userId) throw new Error("Underskriften tillhör en annan användare.");
  if (res.completion.user.personalNumber !== expected.pnr) throw new Error("Fel personnummer i underskriften.");
  if (!sameRequest(p as Record<string, unknown>, req as Record<string, unknown>))
    throw new Error("Uppgifterna har ändrats sedan underskriften.");
  return res;
}
