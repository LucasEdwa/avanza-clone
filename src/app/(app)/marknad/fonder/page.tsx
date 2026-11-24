import { Card, Chips } from "@/components/ui";
import { MarketTabs } from "@/components/market-tabs";
import { InstrumentList, sortRows } from "@/components/instrument-list";
import { listInstruments } from "@/lib/market/lists";

export const metadata = { title: "Fonder" };

export default async function Funds({ searchParams }: PageProps<"/marknad/fonder">) {
  const sp = await searchParams;
  const kat = typeof sp.kategori === "string" ? sp.kategori : "alla";
  const risk = typeof sp.risk === "string" ? sp.risk : "alla";
  const sort = typeof sp.sort === "string" ? sp.sort : "-ytd";
  const all = await listInstruments(["FUND"]);
  let rows = all;
  if (kat !== "alla") rows = rows.filter((r) => r.fundCategory === kat);
  if (risk !== "alla") rows = rows.filter((r) => String(r.fundRisk) === risk);
  if (sp.lagavgift) rows = rows.filter((r) => (r.fundFee ?? 9) <= 0.4);
  rows = sortRows(rows, sort);
  const cats = [...new Set(all.map((r) => r.fundCategory).filter(Boolean))].sort() as string[];
  const href = (p: Record<string, string>) => `/marknad/fonder?${new URLSearchParams({ kategori: kat, risk, sort, ...p })}`;
  return (
    <div>
      <MarketTabs active="fonder" />
      <div className="mb-4 space-y-3">
        <Chips active={kat} items={[{ key: "alla", label: "Alla kategorier", href: href({ kategori: "alla" }) }, ...cats.map((c) => ({ key: c, label: c, href: href({ kategori: c }) }))]} />
        <Chips active={risk} items={[{ key: "alla", label: "Alla risknivåer", href: href({ risk: "alla" }) }, ...["3", "4", "5", "6"].map((r) => ({ key: r, label: `Risk ${r}`, href: href({ risk: r }) }))]} />
      </div>
      <Card>
        <div className="px-5 pt-4 text-sm text-muted">{rows.length} fonder · Köp från 100 kr utan courtage</div>
        <div className="pt-2">
          <InstrumentList
            rows={rows}
            cols={["last", "changePct", "ytd", "fee", "risk", "owners"]}
            sort={sort}
            sortHref={(c) => href({ sort: sort === `-${c}` ? c : `-${c}` })}
            sub={(r) => [r.fundCompany, r.fundCategory].filter(Boolean).join(" · ")}
          />
        </div>
      </Card>
    </div>
  );
}
