import { and, eq, inArray, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { Card, Empty } from "@/components/ui";
import { MinEkonomiTabs } from "@/components/min-ekonomi-tabs";
import { sek, dateSv } from "@/lib/format";
import { NewPlan, PlanActions } from "./plan-forms";

export const metadata = { title: "Månadsspara" };

export default async function MonthlySavings() {
  const user = await requireUser();
  const plans = await db.select({ p: schema.monthlySavings, a: schema.accounts }).from(schema.monthlySavings).innerJoin(schema.accounts, eq(schema.accounts.id, schema.monthlySavings.accountId)).where(eq(schema.monthlySavings.userId, user.id));
  const fundIds = [...new Set(plans.flatMap(({ p }) => p.allocations.map((a) => a.instrumentId)))];
  const fundsInPlans = fundIds.length ? await db.select().from(schema.instruments).where(inArray(schema.instruments.id, fundIds)) : [];
  const accounts = await db.select().from(schema.accounts).where(and(eq(schema.accounts.userId, user.id), ne(schema.accounts.type, "SPARKONTO")));
  const banks = await db.select().from(schema.bankAccounts).where(eq(schema.bankAccounts.userId, user.id));
  const funds = await db.select({ id: schema.instruments.id, name: schema.instruments.name }).from(schema.instruments).where(eq(schema.instruments.type, "FUND")).orderBy(schema.instruments.name);
  return (
    <div>
      <MinEkonomiTabs active="manadsspara" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {plans.length === 0 ? (
            <Card>
              <Empty title="Inget månadssparande ännu">Spara automatiskt i fonder varje månad. Pengarna dras från ditt bankkonto via autogiro.</Empty>
            </Card>
          ) : (
            plans.map(({ p, a }) => (
              <Card key={p.id} className="card-pad">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl font-bold">{sek(p.amount, 0)} / månad</div>
                    <div className="text-sm text-muted">
                      Den {p.dayOfMonth}:e varje månad till {a.name} · {p.active ? "Aktivt" : "Pausat"}
                      {p.lastRunOn ? ` · senast ${dateSv(p.lastRunOn)}` : ""}
                    </div>
                  </div>
                  <PlanActions id={p.id} active={p.active} />
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {p.allocations.map((al) => (
                    <li key={al.instrumentId} className="flex items-center gap-3">
                      <span className="flex-1 truncate">{fundsInPlans.find((f) => f.id === al.instrumentId)?.name}</span>
                      <span className="h-1.5 w-32 rounded-full bg-surface-2">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${al.pct}%` }} />
                      </span>
                      <span className="w-24 text-right tabular-nums">
                        {al.pct} % · {sek((p.amount * al.pct) / 100, 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))
          )}
        </div>
        <Card title="Nytt månadssparande" className="pb-5">
          <div className="px-5 pt-3">
            <NewPlan accounts={accounts.map((a) => ({ id: a.id, name: a.name }))} banks={banks.map((b) => ({ id: b.id, name: `${b.bankName} ${b.clearing}-${b.accountNumber}` }))} funds={funds} />
          </div>
        </Card>
      </div>
    </div>
  );
}
