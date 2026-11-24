import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Plus } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { getHistory, getPortfolio } from "@/lib/portfolio";
import { liveQuotes } from "@/lib/market/live";
import { Card, Change, ChangePill, Notice, Empty } from "@/components/ui";
import { PortfolioChart } from "@/components/charts/portfolio-chart";
import { Donut } from "@/components/charts/donut";
import { HoldingsTable } from "@/components/holdings-table";
import { MinEkonomiTabs } from "@/components/min-ekonomi-tabs";
import { num, pct, price, sek } from "@/lib/format";
import { ACCOUNT_TYPE_SHORT, instrumentPath } from "@/lib/utils";

export const metadata = { title: "Översikt" };

export default async function Overview({ searchParams }: PageProps<"/min-ekonomi/oversikt">) {
  const sp = await searchParams;
  const user = await requireUser();
  const [p, history] = await Promise.all([getPortfolio(user.id), getHistory(user.id)]);
  const activeOrders = await db
    .select({ o: schema.orders, i: schema.instruments })
    .from(schema.orders)
    .innerJoin(schema.instruments, eq(schema.instruments.id, schema.orders.instrumentId))
    .where(and(eq(schema.orders.userId, user.id), eq(schema.orders.status, "ACTIVE")))
    .orderBy(desc(schema.orders.createdAt))
    .limit(5);
  const [wl] = await db.select().from(schema.watchlists).where(eq(schema.watchlists.userId, user.id)).limit(1);
  const wlItems = wl
    ? await db
        .select({ i: schema.instruments })
        .from(schema.watchlistItems)
        .innerJoin(schema.instruments, eq(schema.instruments.id, schema.watchlistItems.instrumentId))
        .where(eq(schema.watchlistItems.watchlistId, wl.id))
        .limit(6)
    : [];
  const indices = await db.select().from(schema.instruments).where(inArray(schema.instruments.symbol, ["^OMX", "^OMXSPI", "^GSPC", "^IXIC", "USDSEK=X"]));
  const q = await liveQuotes([...wlItems.map((w) => w.i), ...indices]);

  const byType = (t: string) => p.holdings.filter((h) => h.instrument.type === t).reduce((s, h) => s + h.valueSek, 0);
  const alloc = [
    { label: "Aktier", value: byType("STOCK") },
    { label: "Fonder", value: byType("FUND") },
    { label: "ETF:er", value: byType("ETF") },
    { label: "Likvida medel", value: p.totals.cash },
  ].filter((a) => a.value > 0);

  return (
    <div>
      <MinEkonomiTabs active="oversikt" />
      {sp.valkommen ? (
        <div className="mb-4">
          <Notice kind="success">Välkommen som kund! Ditt konto är öppnat. Gör en insättning för att börja handla.</Notice>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="card-pad">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm text-muted">Totalt värde</div>
                <div className="text-3xl font-bold tabular-nums sm:text-4xl">{sek(p.totals.total, 0)}</div>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="text-muted">Idag</span>
                  <Change value={p.totals.todaySek} kind="sek" />
                  <ChangePill value={p.totals.todayPct} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/min-ekonomi/insattning" className="btn-primary">
                  <ArrowDownToLine className="h-4 w-4" /> Insättning
                </Link>
                <Link href="/min-ekonomi/uttag" className="btn-secondary">
                  <ArrowUpFromLine className="h-4 w-4" /> Uttag
                </Link>
                <Link href="/min-ekonomi/overforing" className="btn-secondary">
                  <ArrowLeftRight className="h-4 w-4" /> Överför
                </Link>
              </div>
            </div>
            <div className="mt-5">
              <PortfolioChart points={history} />
            </div>
          </Card>

          <Card title="Konton" action={<Link href="/min-ekonomi/oppna-konto" className="flex items-center gap-1 text-sm text-brand"><Plus className="h-4 w-4" /> Öppna konto</Link>}>
            <div className="divide-y divide-border px-4 pb-2 sm:px-5">
              {p.accounts.map((a) => (
                <Link key={a.account.id} href={`/min-ekonomi/konton/${a.account.id}`} className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-surface-2">
                  <div className="min-w-0">
                    <div className="font-medium">{a.account.name}</div>
                    <div className="text-xs text-muted">
                      {ACCOUNT_TYPE_SHORT[a.account.type]} · {a.account.accountNumber} · Köpkraft {sek(a.buyingPower, 0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums">{sek(a.total, 0)}</div>
                    {a.account.type === "SPARKONTO" ? (
                      <div className="text-xs text-muted">Ränta {num(a.account.interestRate, 2)} %</div>
                    ) : (
                      <Change value={a.todayPct} className="text-xs" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card title="Innehav" action={<Link href="/min-ekonomi/innehav" className="text-sm text-brand">Visa alla</Link>}>
            <div className="pt-2 pb-1">
              {p.holdings.length ? <HoldingsTable rows={p.holdings.slice(0, 8)} compact /> : <Empty title="Inga innehav ännu">Sök efter en aktie eller fond för att göra ditt första köp.</Empty>}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Fördelning" className="pb-4">
            <div className="px-4 pt-3 sm:px-5">{alloc.length ? <Donut items={alloc} /> : <p className="text-sm text-muted">Inget att visa.</p>}</div>
            <div className="mt-4 grid grid-cols-2 gap-3 px-4 text-sm sm:px-5">
              <div>
                <div className="text-xs text-muted">Köpkraft</div>
                <div className="font-semibold">{sek(p.totals.buyingPower, 0)}</div>
              </div>
              <div>
                <div className="text-xs text-muted">Orealiserat</div>
                <Change value={p.totals.gainSek} kind="sek" className="font-semibold" />
              </div>
            </div>
          </Card>

          {activeOrders.length ? (
            <Card title="Pågående ordrar" action={<Link href="/min-ekonomi/ordrar" className="text-sm text-brand">Alla</Link>}>
              <ul className="divide-y divide-border px-4 pb-2 text-sm sm:px-5">
                {activeOrders.map(({ o, i }) => (
                  <li key={o.id} className="flex justify-between py-2.5">
                    <span>
                      <span className={o.side === "BUY" ? "font-semibold text-pos" : "font-semibold text-neg"}>{o.side === "BUY" ? "Köp" : "Sälj"}</span> {i.name}
                    </span>
                    <span className="text-muted tabular-nums">{o.type === "FUND" ? (o.amount ? sek(o.amount, 0) : `${num(o.quantity, 0, 4)} andelar`) : `${num(o.quantity, 0)} à ${price(o.limitPrice)}`}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card title={wl?.name ?? "Bevakningar"} action={<Link href="/bevakningar" className="text-sm text-brand">Alla</Link>}>
            <ul className="divide-y divide-border px-4 pb-2 text-sm sm:px-5">
              {wlItems.length === 0 ? <li className="py-3 text-muted">Lägg till aktier att bevaka.</li> : null}
              {wlItems.map(({ i }) => {
                const qq = q.get(i.id);
                return (
                  <li key={i.id}>
                    <Link href={instrumentPath(i)} className="flex justify-between py-2.5 hover:text-brand">
                      <span className="truncate pr-2">{i.name}</span>
                      <span className="flex gap-3 tabular-nums">
                        <span>{price(qq?.last)}</span>
                        <Change value={qq?.changePct} className="w-16 text-right" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="Marknaden idag" action={<Link href="/marknad" className="text-sm text-brand">Marknad</Link>}>
            <ul className="divide-y divide-border px-4 pb-2 text-sm sm:px-5">
              {indices.map((i) => {
                const qq = q.get(i.id);
                return (
                  <li key={i.id}>
                    <Link href={instrumentPath(i)} className="flex justify-between py-2.5 hover:text-brand">
                      <span>{i.name}</span>
                      <span className="flex gap-3 tabular-nums">
                        <span>{num(qq?.last, 2)}</span>
                        <span className={qq?.changePct && qq.changePct < 0 ? "w-16 text-right text-neg" : "w-16 text-right text-pos"}>{pct(qq?.changePct)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
