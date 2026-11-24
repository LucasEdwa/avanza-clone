import { Card, Chips } from "@/components/ui";
import { MarketTabs } from "@/components/market-tabs";
import { InstrumentList, sortRows } from "@/components/instrument-list";
import { listInstruments } from "@/lib/market/lists";

export const metadata = { title: "Aktier" };

const LISTS = [
  ["alla", "Alla"],
  ["Large Cap", "Large Cap"],
  ["Mid Cap", "Mid Cap"],
  ["Small Cap", "Small Cap"],
  ["USA", "USA"],
  ["Norden", "Norden övrigt"],
];

export default async function Stocks({ searchParams }: PageProps<"/marknad/aktier">) {
  const sp = await searchParams;
  const lista = typeof sp.lista === "string" ? sp.lista : "alla";
  const sektor = typeof sp.sektor === "string" ? sp.sektor : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "-marketCap";
  const all = await listInstruments(["STOCK"]);
  let rows = all;
  if (lista === "Norden") rows = rows.filter((r) => r.segment === "Danmark" || r.segment === "Norge");
  else if (lista !== "alla") rows = rows.filter((r) => r.segment === lista);
  if (sektor) rows = rows.filter((r) => r.sector === sektor);
  rows = sortRows(rows, sort);
  const sectors = [...new Set(all.map((r) => r.sector).filter(Boolean))].sort() as string[];
  const href = (p: Record<string, string>) => {
    const q = new URLSearchParams({ lista, sort, ...(sektor ? { sektor } : {}), ...p });
    if (!q.get("sektor")) q.delete("sektor");
    return `/marknad/aktier?${q}`;
  };
  return (
    <div>
      <MarketTabs active="aktier" />
      <div className="mb-4 space-y-3">
        <Chips active={lista} items={LISTS.map(([k, l]) => ({ key: k, label: l, href: href({ lista: k }) }))} />
        <Chips active={sektor || "alla"} items={[{ key: "alla", label: "Alla branscher", href: href({ sektor: "" }) }, ...sectors.map((s) => ({ key: s, label: s, href: href({ sektor: s }) }))]} />
      </div>
      <Card>
        <div className="flex items-center justify-between px-5 pt-4 text-sm text-muted">{rows.length} aktier</div>
        <div className="pt-2">
          <InstrumentList
            rows={rows}
            cols={["last", "changePct", "turnover", "marketCap", "pe", "dividendYield", "owners"]}
            sort={sort}
            sortHref={(c) => href({ sort: sort === `-${c}` ? c : `-${c}` })}
            sub={(r) => [r.ticker, r.segment, r.sector].filter(Boolean).join(" · ")}
          />
        </div>
      </Card>
    </div>
  );
}
