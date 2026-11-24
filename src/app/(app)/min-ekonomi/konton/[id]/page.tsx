import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getHistory, getPortfolio } from "@/lib/portfolio";
import { Card, Change, Empty, PageHeader, Stat } from "@/components/ui";
import { HoldingsTable } from "@/components/holdings-table";
import { PortfolioChart } from "@/components/charts/portfolio-chart";
import { TxTable } from "@/components/tx-table";
import { num, sek } from "@/lib/format";
import { ACCOUNT_TYPE_LABEL } from "@/lib/utils";
import { RenameAccount } from "./rename";

export default async function AccountPage({ params }: PageProps<"/min-ekonomi/konton/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const [acc] = await db.select().from(schema.accounts).where(and(eq(schema.accounts.id, id), eq(schema.accounts.userId, user.id)));
  if (!acc) notFound();
  const [p, history] = await Promise.all([getPortfolio(user.id, id), getHistory(user.id, [id])]);
  const s = p.accounts[0];
  const txs = await db
    .select({ t: schema.transactions, i: schema.instruments, a: schema.accounts })
    .from(schema.transactions)
    .innerJoin(schema.accounts, eq(schema.accounts.id, schema.transactions.accountId))
    .leftJoin(schema.instruments, eq(schema.instruments.id, schema.transactions.instrumentId))
    .where(eq(schema.transactions.accountId, id))
    .orderBy(desc(schema.transactions.bookedAt))
    .limit(15);

  return (
    <div>
      <PageHeader
        back={{ href: "/min-ekonomi/oversikt", label: "Översikt" }}
        title={<RenameAccount id={acc.id} name={acc.name} />}
        subtitle={`${ACCOUNT_TYPE_LABEL[acc.type]} · Kontonummer ${acc.accountNumber}`}
        actions={
          <>
            <Link href={`/min-ekonomi/insattning?konto=${acc.id}`} className="btn-primary">
              Insättning
            </Link>
            <Link href={`/min-ekonomi/uttag?konto=${acc.id}`} className="btn-secondary">
              Uttag
            </Link>
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="card-pad lg:col-span-2">
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Totalt värde" value={sek(s.total, 0)} />
            <Stat label="Idag" value={<Change value={s.todaySek} kind="sek" />} />
            <Stat label="Köpkraft" value={sek(s.buyingPower)} />
            <Stat label={acc.type === "SPARKONTO" ? "Ränta" : "Orealiserat"} value={acc.type === "SPARKONTO" ? `${num(acc.interestRate, 2)} %` : <Change value={s.gainSek} kind="sek" />} />
          </div>
          <PortfolioChart points={history} height={220} />
        </Card>
        <Card title="Saldo" className="pb-4">
          <dl className="space-y-2 px-5 pt-3 text-sm">
            {[
              ["Likvida medel", sek(s.cash)],
              ["Reserverat för ordrar", sek(s.reserved)],
              ["Köpkraft", sek(s.buyingPower)],
              ["Värde innehav", sek(s.holdingsValue)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          {acc.type === "ISK" || acc.type === "KF" ? (
            <p className="mt-4 px-5 text-xs text-muted">
              {acc.type === "ISK" ? "Investeringssparkonto beskattas med schablonskatt" : "Kapitalförsäkringen beskattas med avkastningsskatt"}. Se{" "}
              <Link href="/min-ekonomi/skatt" className="underline">
                skatt
              </Link>
              .
            </p>
          ) : null}
        </Card>
      </div>
      {acc.type !== "SPARKONTO" ? (
        <Card title="Innehav" className="mt-5">
          <div className="pt-2">{p.holdings.length ? <HoldingsTable rows={p.holdings} /> : <Empty title="Inga innehav på kontot" />}</div>
        </Card>
      ) : null}
      <Card title="Senaste transaktioner" className="mt-5" action={<Link href={`/min-ekonomi/transaktioner?konto=${acc.id}`} className="text-sm text-brand">Alla</Link>}>
        <div className="pt-2">{txs.length ? <TxTable rows={txs} showAccount={false} /> : <Empty title="Inga transaktioner" />}</div>
      </Card>
    </div>
  );
}
