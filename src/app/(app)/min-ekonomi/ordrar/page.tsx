import Link from "next/link";
import { and, desc, eq, ne } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { Card, Empty } from "@/components/ui";
import { MinEkonomiTabs } from "@/components/min-ekonomi-tabs";
import { dateSv, dateTimeSv, num, price, sek } from "@/lib/format";
import { cn, instrumentPath } from "@/lib/utils";
import { OrderRowActions } from "./order-row-actions";
import { isMarketOpen, venueForSymbol } from "@/lib/market-hours";

export const metadata = { title: "Ordrar" };

const STATUS: Record<string, [string, string]> = {
  ACTIVE: ["Aktiv", "bg-brand-soft text-brand"],
  FILLED: ["Utförd", "bg-pos-soft text-pos"],
  CANCELLED: ["Makulerad", "bg-surface-2 text-muted"],
  EXPIRED: ["Utgången", "bg-surface-2 text-muted"],
  REJECTED: ["Avvisad", "bg-neg-soft text-neg"],
};

export default async function Orders() {
  const user = await requireUser();
  const q = (active: boolean) =>
    db
      .select({ o: schema.orders, i: schema.instruments, a: schema.accounts })
      .from(schema.orders)
      .innerJoin(schema.instruments, eq(schema.instruments.id, schema.orders.instrumentId))
      .innerJoin(schema.accounts, eq(schema.accounts.id, schema.orders.accountId))
      .where(and(eq(schema.orders.userId, user.id), active ? eq(schema.orders.status, "ACTIVE") : ne(schema.orders.status, "ACTIVE")))
      .orderBy(desc(schema.orders.updatedAt))
      .limit(active ? 100 : 60);
  const [active, done] = await Promise.all([q(true), q(false)]);

  const desc_ = (o: typeof schema.orders.$inferSelect) =>
    o.type === "FUND" ? (o.amount ? sek(o.amount) : `${num(o.quantity, 0, 4)} andelar`) : `${num(o.quantity, 0)} st à ${price(o.limitPrice)}`;

  return (
    <div>
      <MinEkonomiTabs active="ordrar" />
      <Card title="Pågående ordrar" className="mb-5">
        {active.length === 0 ? (
          <Empty title="Inga pågående ordrar" />
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="table">
              <thead>
                <tr>
                  <th>Lagd</th>
                  <th>Konto</th>
                  <th>Typ</th>
                  <th>Värdepapper</th>
                  <th className="num">Order</th>
                  <th>Villkor</th>
                  <th>Giltig t.o.m.</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {active.map(({ o, i, a }) => (
                  <tr key={o.id}>
                    <td className="text-muted">{dateTimeSv(o.createdAt)}</td>
                    <td className="text-muted">{a.name}</td>
                    <td className={o.side === "BUY" ? "font-semibold text-pos" : "font-semibold text-neg"}>{o.side === "BUY" ? "Köp" : "Sälj"}</td>
                    <td>
                      <Link href={instrumentPath(i)} className="hover:text-brand">
                        {i.name}
                      </Link>
                    </td>
                    <td className="num">{desc_(o)}</td>
                    <td className="text-xs text-muted">
                      {o.type === "STOP_LOSS" ? `Stop loss ${o.triggered ? "(aktiverad)" : `vid ${price(o.triggerPrice)}`}` : o.type === "FUND" ? `NAV ${dateTimeSv(o.executeAfter)}` : "Limit"}
                    </td>
                    <td className="text-muted">{dateSv(o.validUntil)}</td>
                    <td>
                      <span className="badge bg-brand-soft text-brand">{i.type === "FUND" ? "Väntar på NAV" : isMarketOpen(venueForSymbol(i.symbol)) ? "I orderboken" : "Väntar på öppning"}</span>
                    </td>
                    <td>
                      <OrderRowActions id={o.id} editable={o.type !== "FUND"} quantity={o.quantity ?? 0} limitPrice={o.limitPrice ?? 0} validUntil={o.validUntil} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Card title="Avslutade ordrar">
        {done.length === 0 ? (
          <Empty title="Inga avslutade ordrar" />
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Konto</th>
                  <th>Typ</th>
                  <th>Värdepapper</th>
                  <th className="num">Order</th>
                  <th className="num">Avslutspris</th>
                  <th className="num">Courtage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {done.map(({ o, i, a }) => (
                  <tr key={o.id}>
                    <td className="text-muted">{dateTimeSv(o.filledAt ?? o.updatedAt)}</td>
                    <td className="text-muted">{a.name}</td>
                    <td className={o.side === "BUY" ? "font-semibold text-pos" : "font-semibold text-neg"}>{o.side === "BUY" ? "Köp" : "Sälj"}</td>
                    <td>
                      <Link href={instrumentPath(i)} className="hover:text-brand">
                        {i.name}
                      </Link>
                    </td>
                    <td className="num">{desc_(o)}</td>
                    <td className="num">{o.fillPrice ? `${num(o.filledQuantity, 0, 4)} à ${price(o.fillPrice)}` : "–"}</td>
                    <td className="num text-muted">{o.courtage ? num(o.courtage, 2) : ""}</td>
                    <td>
                      <span className={cn("badge", STATUS[o.status][1])} title={o.statusReason ?? undefined}>
                        {STATUS[o.status][0]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
