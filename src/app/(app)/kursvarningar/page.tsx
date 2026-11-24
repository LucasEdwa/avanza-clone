import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { liveQuotes } from "@/lib/market/live";
import { Card, Empty, PageHeader } from "@/components/ui";
import { dateTimeSv, pct, price } from "@/lib/format";
import { instrumentPath } from "@/lib/utils";
import { DeleteAlert } from "./delete-alert";

export const metadata = { title: "Kursvarningar" };

export default async function Alerts() {
  const user = await requireUser();
  const rows = await db
    .select({ a: schema.priceAlerts, i: schema.instruments })
    .from(schema.priceAlerts)
    .innerJoin(schema.instruments, eq(schema.instruments.id, schema.priceAlerts.instrumentId))
    .where(eq(schema.priceAlerts.userId, user.id))
    .orderBy(desc(schema.priceAlerts.createdAt));
  const q = await liveQuotes(rows.map((r) => r.i));
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Kursvarningar" subtitle="Få en notis när kursen passerar en nivå. Skapa nya från en akties sida." />
      <Card>
        {rows.length === 0 ? (
          <Empty title="Inga kursvarningar" />
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="table">
              <thead>
                <tr>
                  <th>Värdepapper</th>
                  <th>Villkor</th>
                  <th className="num">Senast</th>
                  <th className="num">Avstånd</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ a, i }) => {
                  const last = q.get(i.id)?.last;
                  return (
                    <tr key={a.id}>
                      <td>
                        <Link href={instrumentPath(i)} className="font-medium hover:text-brand">
                          {i.name}
                        </Link>
                      </td>
                      <td>
                        {a.direction === "ABOVE" ? "Över" : "Under"} {price(a.price)} {i.currency}
                      </td>
                      <td className="num">{price(last)}</td>
                      <td className="num text-muted">{last ? pct((a.price / last - 1) * 100) : "–"}</td>
                      <td>{a.active ? <span className="badge bg-brand-soft text-brand">Aktiv</span> : <span className="badge bg-pos-soft text-pos">Utlöst {dateTimeSv(a.triggeredAt)}</span>}</td>
                      <td>
                        <DeleteAlert id={a.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
