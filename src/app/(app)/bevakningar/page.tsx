import { asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { liveQuotes } from "@/lib/market/live";
import { Card, Empty, PageHeader } from "@/components/ui";
import { InstrumentList } from "@/components/instrument-list";
import { WatchlistControls, RemoveFromList } from "./controls";

export const metadata = { title: "Bevakningar" };

export default async function Watchlists() {
  const user = await requireUser();
  const lists = await db.select().from(schema.watchlists).where(eq(schema.watchlists.userId, user.id)).orderBy(asc(schema.watchlists.createdAt));
  const items = lists.length
    ? await db
        .select({ w: schema.watchlistItems, i: schema.instruments })
        .from(schema.watchlistItems)
        .innerJoin(schema.instruments, eq(schema.instruments.id, schema.watchlistItems.instrumentId))
        .where(inArray(schema.watchlistItems.watchlistId, lists.map((l) => l.id)))
    : [];
  const quotes = await liveQuotes(items.map((x) => x.i));
  return (
    <div>
      <PageHeader title="Bevakningar" subtitle="Följ aktier och fonder du är intresserad av." actions={<WatchlistControls />} />
      <div className="space-y-5">
        {lists.map((l) => {
          const rows = items.filter((x) => x.w.watchlistId === l.id).map((x) => ({ ...x.i, quote: quotes.get(x.i.id), owners: 0 }));
          return (
            <Card key={l.id} title={l.name} action={<WatchlistControls list={{ id: l.id, name: l.name }} />}>
              {rows.length ? (
                <div className="pt-2">
                  <InstrumentList rows={rows} cols={["last", "changePct", "high52", "marketCap"]} />
                  <div className="flex flex-wrap gap-2 px-5 pb-4">
                    {rows.map((r) => (
                      <RemoveFromList key={r.id} listId={l.id} instrumentId={r.id} name={r.ticker} />
                    ))}
                  </div>
                </div>
              ) : (
                <Empty title="Listan är tom">Sök efter en aktie eller fond och klicka på &quot;Bevaka&quot;.</Empty>
              )}
            </Card>
          );
        })}
        {!lists.length ? <Empty title="Du har inga bevakningslistor" /> : null}
      </div>
    </div>
  );
}
