import { Card } from "@/components/ui";
import { MarketTabs } from "@/components/market-tabs";
import { InstrumentList, sortRows } from "@/components/instrument-list";
import { listInstruments } from "@/lib/market/lists";

export const metadata = { title: "Börshandlade fonder" };

export default async function Etfs({ searchParams }: PageProps<"/marknad/borshandlade-fonder">) {
  const sp = await searchParams;
  const sort = typeof sp.sort === "string" ? sp.sort : "-turnover";
  const rows = sortRows(await listInstruments(["ETF"]), sort);
  return (
    <div>
      <MarketTabs active="etf" />
      <Card>
        <div className="px-5 pt-4 text-sm text-muted">Börshandlade fonder handlas som aktier under börsens öppettider, med courtage.</div>
        <div className="pt-2">
          <InstrumentList rows={rows} cols={["last", "changePct", "volume", "high52", "owners"]} sort={sort} sortHref={(c) => `/marknad/borshandlade-fonder?sort=${sort === `-${c}` ? c : `-${c}`}`} sub={(r) => `${r.ticker} · ${r.exchange ?? ""}`} />
        </div>
      </Card>
    </div>
  );
}
