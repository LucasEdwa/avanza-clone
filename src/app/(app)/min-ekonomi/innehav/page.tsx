import { requireUser } from "@/lib/auth";
import { getPortfolio } from "@/lib/portfolio";
import { Card, Change, Empty } from "@/components/ui";
import { HoldingsTable } from "@/components/holdings-table";
import { MinEkonomiTabs } from "@/components/min-ekonomi-tabs";
import { Donut } from "@/components/charts/donut";
import { sek } from "@/lib/format";
import Link from "next/link";

export const metadata = { title: "Innehav" };

export default async function Holdings() {
  const user = await requireUser();
  const p = await getPortfolio(user.id);
  const sectors = new Map<string, number>();
  for (const h of p.holdings) {
    const k = h.instrument.type === "FUND" ? h.instrument.fundCategory ?? "Fonder" : h.instrument.type === "ETF" ? "ETF:er" : h.instrument.sector ?? "Övrigt";
    sectors.set(k, (sectors.get(k) ?? 0) + h.valueSek);
  }
  const sectorItems = [...sectors].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const top = sectorItems.slice(0, 7);
  if (sectorItems.length > 7) top.push({ label: "Övrigt", value: sectorItems.slice(7).reduce((s, x) => s + x.value, 0) });
  const byAccount = p.accounts.filter((a) => a.total > 0).map((a) => ({ label: a.account.name, value: a.total }));

  return (
    <div>
      <MinEkonomiTabs active="innehav" />
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        {[
          ["Värde innehav", sek(p.totals.holdingsValue, 0)],
          ["Likvida medel", sek(p.totals.cash, 0)],
          ["Utveckling idag", <Change key="t" value={p.totals.todaySek} kind="sek" />],
          ["Orealiserad vinst/förlust", <Change key="g" value={p.totals.gainSek} kind="sek" />],
        ].map(([l, v]) => (
          <div key={l as string} className="card p-4">
            <div className="text-xs text-muted">{l}</div>
            <div className="mt-1 text-lg font-semibold tabular-nums">{v}</div>
          </div>
        ))}
      </div>
      <Card className="mb-5">
        {p.holdings.length ? (
          <div className="pt-2">
            <HoldingsTable rows={p.holdings} showAccount />
          </div>
        ) : (
          <Empty title="Du har inga innehav" action={<Link className="btn-primary" href="/marknad">Utforska marknaden</Link>} />
        )}
      </Card>
      {p.holdings.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          <Card title="Fördelning per bransch/kategori" className="pb-5">
            <div className="px-5 pt-3">
              <Donut items={top} />
            </div>
          </Card>
          <Card title="Fördelning per konto" className="pb-5">
            <div className="px-5 pt-3">
              <Donut items={byAccount} />
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
