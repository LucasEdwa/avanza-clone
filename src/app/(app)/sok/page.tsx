import Link from "next/link";
import { Search } from "lucide-react";
import { searchInstruments } from "@/lib/search";
import { searchYahoo } from "@/lib/market/data";
import { Card, Empty } from "@/components/ui";
import { InstrumentList } from "@/components/instrument-list";

export const metadata = { title: "Sök" };

export default async function SearchPage({ searchParams }: PageProps<"/sok">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const local = q ? await searchInstruments(q, 30) : [];
  const known = new Set(local.map((l) => l.symbol));
  const remote = q && local.length < 5 ? (await searchYahoo(q)).filter((r) => !known.has(r.symbol)) : [];
  const path = (t: string, s: string) => (t === "MUTUALFUND" ? `/fonder/${s}` : t === "ETF" ? `/borshandlade-fonder/${s}` : t === "INDEX" ? `/index/${s}` : `/aktier/${s}`);
  return (
    <div className="mx-auto max-w-4xl">
      <form className="mb-5 flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 focus-within:border-brand">
        <Search className="h-5 w-5 text-muted" />
        <input name="q" defaultValue={q} autoFocus placeholder="Sök aktie, fond, ETF eller index" className="w-full bg-transparent text-lg outline-none" />
      </form>
      {q ? (
        <>
          <Card>
            {local.length ? (
              <div className="pt-2">
                <InstrumentList rows={local.map((l) => ({ ...l, quote: l.quote ?? undefined, owners: 0 }))} cols={["last", "changePct"]} />
              </div>
            ) : (
              <Empty title={`Inga träffar för "${q}"`} />
            )}
          </Card>
          {remote.length ? (
            <Card title="Fler resultat från världens marknader" className="mt-5">
              <ul className="divide-y divide-border px-5 pb-2 text-sm">
                {remote.map((r) => (
                  <li key={r.symbol}>
                    <Link href={path(r.type, encodeURIComponent(r.symbol))} className="flex justify-between py-2.5 hover:text-brand">
                      <span>{r.name}</span>
                      <span className="text-muted">
                        {r.symbol} · {r.exchange}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </>
      ) : (
        <p className="text-center text-sm text-muted">Skriv namnet eller kortnamnet på ett värdepapper.</p>
      )}
    </div>
  );
}
