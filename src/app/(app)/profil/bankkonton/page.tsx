import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { Card, Empty, PageHeader } from "@/components/ui";
import { dateSv } from "@/lib/format";
import { AddBankAccount, RemoveBank } from "./bank-forms";

export const metadata = { title: "Bankkonton" };

export default async function Banks() {
  const user = await requireUser();
  const banks = await db.select().from(schema.bankAccounts).where(eq(schema.bankAccounts.userId, user.id));
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader back={{ href: "/profil", label: "Profil" }} title="Kopplade bankkonton" subtitle="Används för insättningar, uttag och månadssparande. Nya konton signeras med BankID." />
      <Card className="mb-5">
        {banks.length === 0 ? (
          <Empty title="Inga kopplade bankkonton" />
        ) : (
          <ul className="divide-y divide-border px-5">
            {banks.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3">
                <span>
                  <span className="font-medium">{b.bankName}</span>
                  <span className="block text-sm text-muted">
                    {b.clearing}-{b.accountNumber} · tillagt {dateSv(b.createdAt)}
                  </span>
                </span>
                <RemoveBank id={b.id} />
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Koppla nytt bankkonto" className="pb-5">
        <div className="px-5 pt-3">
          <AddBankAccount />
        </div>
      </Card>
    </div>
  );
}
