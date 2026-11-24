import Link from "next/link";
import { Card, Change } from "@/components/ui";
import { MarketTabs } from "@/components/market-tabs";
import { InstrumentList } from "@/components/instrument-list";
import { PriceChart } from "@/components/charts/price-chart";
import { listInstruments, type Row } from "@/lib/market/lists";
import { isMarketOpen } from "@/lib/market-hours";
import { num, pct } from "@/lib/format";
import { cn, instrumentPath } from "@/lib/utils";

export const metadata = { title: "Marknaden idag" };

function MiniTable({ rows }: { rows: Row[] }) {
  return (
    <ul className="divide-y divide-border px-5 pb-2 text-sm">
      {rows.map((r) => (
        <li key={r.id}>
          <Link href={instrumentPath(r)} className="flex items-center justify-between py-2.5 hover:text-brand">
            <span className="truncate pr-2">{r.name}</span>
            <span className="flex gap-4 tabular-nums">
              <span>{num(r.quote?.last, 2)}</span>
              <Change value={r.quote?.changePct} className="w-16 text-right" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function Market() {
  const [stocks, other] = await Promise.all([listInstruments(["STOCK"]), listInstruments(["INDEX", "CURRENCY", "COMMODITY", "CRYPTO"])]);
  const se = stocks.filter((s) => s.country === "SE" && s.quote?.changePct != null);
  const winners = [...se].sort((a, b) => b.quote!.changePct! - a.quote!.changePct!).slice(0, 6);
  const losers = [...se].sort((a, b) => a.quote!.changePct! - b.quote!.changePct!).slice(0, 6);
  const turnover = [...se].sort((a, b) => (b.quote?.volume ?? 0) * (b.quote?.last ?? 0) - (a.quote?.volume ?? 0) * (a.quote?.last ?? 0)).slice(0, 8);
  const owned = [...stocks].filter((s) => s.owners > 0).sort((a, b) => b.owners - a.owners).slice(0, 8);
  const omx = other.find((o) => o.symbol === "^OMX");
  const idx = other.filter((o) => o.type === "INDEX");
  const fx = other.filter((o) => o.type !== "INDEX");
  const open = isMarketOpen("STO");
  const up = se.filter((s) => (s.quote?.changePct ?? 0) > 0).length;

  return (
    <div>
      <MarketTabs active="oversikt" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="card-pad lg:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-sm text-muted">
                OMX Stockholm 30 · <span className={open ? "text-pos" : ""}>{open ? "Börsen är öppen" : "Börsen är stängd"}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold tabular-nums">{num(omx?.quote?.last, 2)}</span>
                <Change value={omx?.quote?.changePct} className="text-lg font-semibold" />
              </div>
            </div>
            <div className="text-sm text-muted">
              <span className="text-pos">{up} upp</span> · <span className="text-neg">{se.length - up} ned</span> av {se.length} aktier
            </div>
          </div>
          <div className="mt-4">{omx ? <PriceChart symbol={omx.symbol} prevClose={omx.quote?.prevClose} height={260} /> : null}</div>
        </Card>
        <Card title="Index">
          <MiniTable rows={idx} />
        </Card>
        <Card title="Vinnare idag">
          <MiniTable rows={winners} />
        </Card>
        <Card title="Förlorare idag">
          <MiniTable rows={losers} />
        </Card>
        <Card title="Valutor, råvaror & krypto">
          <ul className="divide-y divide-border px-5 pb-2 text-sm">
            {fx.map((r) => (
              <li key={r.id}>
                <Link href={instrumentPath(r)} className="flex items-center justify-between py-2.5 hover:text-brand">
                  <span>{r.name}</span>
                  <span className="flex gap-4 tabular-nums">
                    <span>{num(r.quote?.last, r.type === "CURRENCY" ? 4 : 2)}</span>
                    <span className={cn("w-16 text-right", (r.quote?.changePct ?? 0) >= 0 ? "text-pos" : "text-neg")}>{pct(r.quote?.changePct)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Mest omsatta (Stockholm)" className="lg:col-span-2">
          <div className="pt-2">
            <InstrumentList rows={turnover} cols={["last", "changePct", "turnover", "marketCap"]} />
          </div>
        </Card>
        <Card title="Mest ägda hos Spira">
          {owned.length ? <MiniTable rows={owned} /> : <p className="px-5 pb-4 text-sm text-muted">Inga ägare ännu.</p>}
        </Card>
      </div>
    </div>
  );
}
