import Link from "next/link";
import { inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Instrument, Quote } from "@/db/schema";
import { liveQuotes } from "@/lib/market/live";
import { listInstruments, type Row } from "@/lib/market/lists";
import { getNews, getProfile } from "@/lib/market/data";

async function getNewsAny(qs: string[]) {
  for (const q of qs) {
    const n = await getNews(q);
    if (n.length) return n;
  }
  return [];
}
import { dateSv, num, pct, price, relativeSv, timeSv, trendClass } from "@/lib/format";
import { cn, instrumentPath } from "@/lib/utils";
import { FLAG, RiskNotice } from "@/components/handla/common";
import { PriceChart } from "@/components/charts/price-chart";

export const metadata = { title: "Börsen idag" };

type G = [symbol: string, flag: string, label?: string][];
const NORDIC: G = [["^OMXS30GI", "SE", "OMX Stockholm 30 GI"], ["^OMX", "SE", "OMX Stockholm 30"], ["^OMXSPI", "SE", "OMX Stockholm PI"], ["^OMXSBGI", "SE", "OMX Stockholm Benchmark GI"], ["^OMXH25", "FI", "OMX Helsinki 25"], ["^OMXC25", "DK", "OMX Copenhagen 25"], ["OBX.OL", "NO", "Oslo Børs OBX"]];
const WORLD: G = [["^GSPC", "US", "S&P 500"], ["^NDX", "US", "Nasdaq 100"], ["^IXIC", "US", "Nasdaq Composite"], ["^DJI", "US", "Dow Jones"], ["^GSPTSE", "CA", "S&P/TSX Kanada"], ["^N225", "JP", "Nikkei 225"], ["^HSI", "HK", "Hang Seng"], ["^KS11", "KR", "KOSPI"], ["^BSESN", "IN", "Sensex"]];
const EUROPE: G = [["^GDAXI", "DE", "DAX"], ["^FCHI", "FR", "CAC 40"], ["^FTSE", "GB", "FTSE 100"], ["FTSEMIB.MI", "IT", "FTSE MIB"], ["PSI20.LS", "PT", "PSI"], ["^AEX", "NL", "AEX"], ["^BFX", "BE", "BEL 20"], ["^STOXX50E", "EU", "Euro Stoxx 50"]];
const COMMOD: G = [["GC=F", "", "Guld"], ["SI=F", "", "Silver"], ["BZ=F", "", "Olja (Brent)"], ["HG=F", "", "Koppar"], ["PL=F", "", "Platina"], ["NG=F", "", "Naturgas"], ["BTC-USD", "", "Bitcoin"]];
const FX: G = [["USDSEK=X", "", "USD/SEK"], ["EURSEK=X", "", "EUR/SEK"], ["NOKSEK=X", "", "NOK/SEK"], ["DKKSEK=X", "", "DKK/SEK"], ["EURUSD=X", "", "EUR/USD"], ["GBPSEK=X", "", "GBP/SEK"], ["CADSEK=X", "", "CAD/SEK"]];
const RATES: G = [["^IRX", "US", "3-mån ränta"], ["^FVX", "US", "5-års ränta"], ["^TNX", "US", "10-års ränta"], ["^TYX", "US", "30-års ränta"]];

// approximate positions (% of map width/height) for the overview map
const MAP: [string, number, number][] = [
  ["^GSPTSE", 18, 24], ["^GSPC", 20, 33], ["^NDX", 20, 40], ["^DJI", 20, 47],
  ["^OMX", 51, 13], ["^STOXX50E", 47, 27], ["^GDAXI", 47, 34], ["^FTSE", 41, 41],
  ["^N225", 84, 30], ["^KS11", 81, 37], ["^HSI", 77, 45], ["^BSESN", 68, 52],
];

type Rows = Map<string, { i: Instrument; q: Quote | undefined }>;

function IndexTable({ title, subtitle, list, rows, decimals = 2, col = "Index" }: { title: string; subtitle?: string; list: G; rows: Rows; decimals?: number; col?: string }) {
  return (
    <section className="card overflow-hidden">
      <div className="px-4 pt-3.5 pb-2">
        <h2 className="font-semibold">{title}</h2>
        {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
      </div>
      <table className="w-full text-[13px] tabular-nums [&_td:not(:first-child)]:whitespace-nowrap">
        <thead>
          <tr className="border-y border-border text-xs text-muted">
            <th className="px-4 py-1.5 text-left font-medium">{col}</th>
            <th className="px-2 py-1.5 text-right font-medium">+/- %</th>
            <th className="px-2 py-1.5 text-right font-medium">Senast</th>
            <th className="px-4 py-1.5 text-right font-medium">Tid</th>
          </tr>
        </thead>
        <tbody>
          {list.map(([sym, flag, label]) => {
            const r = rows.get(sym);
            if (!r) return null;
            return (
              <tr key={sym} className="border-b border-border last:border-0 hover:bg-surface-2">
                <td className="px-4 py-2">
                  <Link href={instrumentPath(r.i)} className="flex items-center gap-2 hover:text-brand">
                    {flag ? <span>{FLAG[flag]}</span> : null}
                    {label ?? r.i.name}
                  </Link>
                </td>
                <td className={cn("px-2 py-2 text-right", trendClass(r.q?.changePct))}>{pct(r.q?.changePct)}</td>
                <td className="px-2 py-2 text-right">{num(r.q?.last, decimals)}</td>
                <td className="px-4 py-2 text-right text-muted">{r.q?.marketTime ? timeSv(r.q.marketTime).slice(0, 5) : "–"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function Movers({ title, list }: { title: string; list: Row[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="px-4 pt-3.5 pb-2">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-xs text-muted">Stockholmsbörsen</p>
      </div>
      <table className="w-full text-[13px] tabular-nums [&_td:not(:first-child)]:whitespace-nowrap">
        <thead>
          <tr className="border-y border-border text-xs text-muted">
            <th className="px-4 py-1.5 text-left font-medium" colSpan={2}>
              Aktie
            </th>
            <th className="px-2 py-1.5 text-right font-medium">+/- %</th>
            <th className="px-4 py-1.5 text-right font-medium">Senast</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface-2">
              <td className="w-[5.5rem] py-2 pl-4 text-xs whitespace-nowrap">
                <Link href={`${instrumentPath(s)}?sida=kop`} className="mr-2 font-semibold text-brand hover:underline">
                  Köp
                </Link>
                <Link href={`${instrumentPath(s)}?sida=salj`} className="font-semibold text-neg hover:underline">
                  Sälj
                </Link>
              </td>
              <td className="py-2 pr-2">
                <Link href={instrumentPath(s)} className="hover:text-brand">
                  {s.name.replace(/\s*\(publ\)/, "")}
                </Link>
              </td>
              <td className={cn("px-2 py-2 text-right", trendClass(s.quote?.changePct))}>{pct(s.quote?.changePct)}</td>
              <td className="px-4 py-2 text-right">{price(s.quote?.last)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/marknad/aktier/screener?sort=-today" className="block border-t border-border py-2.5 text-right pr-4 text-sm text-brand hover:underline">
        Visa fler
      </Link>
    </section>
  );
}

export default async function BorsenIdag() {
  const symbols = [...NORDIC, ...WORLD, ...EUROPE, ...COMMOD, ...FX, ...RATES].map((x) => x[0]);
  const insts = await db.select().from(schema.instruments).where(inArray(schema.instruments.symbol, symbols));
  const [quotes, stocks, news] = await Promise.all([liveQuotes(insts), listInstruments(["STOCK"]), getNewsAny(["OMX Stockholm 30", "Swedish stocks", "stock market"])]);
  const rows: Rows = new Map(insts.map((i) => [i.symbol, { i, q: quotes.get(i.id) }]));

  const se = stocks.filter((s) => s.country === "SE" && s.quote?.changePct != null);
  const winners = [...se].sort((a, b) => b.quote!.changePct! - a.quote!.changePct!).slice(0, 10);
  const losers = [...se].sort((a, b) => a.quote!.changePct! - b.quote!.changePct!).slice(0, 10);

  // company calendar: next report / ex-dividend for the largest Swedish companies
  const big = [...se].sort((a, b) => (b.quote?.marketCap ?? 0) - (a.quote?.marketCap ?? 0)).slice(0, 30);
  const events: { date: string; name: string; href: string; kind: string }[] = [];
  let k = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (k < big.length) {
        const s = big[k++];
        const p = await getProfile(s.symbol, "STOCK").catch(() => null);
        const today = new Date().toISOString().slice(0, 10);
        if (p?.earningsDate && p.earningsDate >= today) events.push({ date: p.earningsDate, name: s.name, href: instrumentPath(s), kind: "Rapport" });
        if (p?.exDividendDate && p.exDividendDate >= today) events.push({ date: p.exDividendDate, name: s.name, href: instrumentPath(s), kind: "X-dag utdelning" });
      }
    }),
  );
  events.sort((a, b) => a.date.localeCompare(b.date));
  const omx = rows.get("^OMX");


  return (
    <div className="mx-auto max-w-6xl">
      <RiskNotice />
      <h1 className="text-3xl font-bold tracking-tight">Börsen idag</h1>
      <p className="mt-2 mb-5 max-w-3xl text-sm text-muted">
        Dagens läge på börserna i Sverige och världen: index, räntor, råvaror och valutor, plus vinnare och förlorare på Stockholmsbörsen och de senaste nyheterna. Kurserna uppdateras löpande.
      </p>

      {/* World overview map */}
      <div className="card relative mb-5 h-72 overflow-hidden bg-mint">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-60" aria-hidden>
          <defs>
            <pattern id="dots" width="1.2" height="1.2" patternUnits="userSpaceOnUse">
              <circle cx="0.6" cy="0.6" r="0.28" fill="#0b8a4f" opacity="0.35" />
            </pattern>
          </defs>
          {/* stylised continents */}
          <path d="M6 10 Q14 4 26 7 L31 14 Q28 20 24 22 L22 28 Q17 27 14 22 Q8 18 6 10Z" fill="url(#dots)" />
          <path d="M24 30 Q29 30 31 35 Q30 44 26 48 Q23 42 23 36Z" fill="url(#dots)" />
          <path d="M44 9 Q50 4 57 8 L56 14 Q52 18 47 17 Q43 14 44 9Z" fill="url(#dots)" />
          <path d="M45 20 Q52 18 57 22 Q58 32 53 40 Q49 38 47 30 Q44 26 45 20Z" fill="url(#dots)" />
          <path d="M57 8 Q72 3 88 9 L90 18 Q84 24 78 26 L72 30 Q66 28 63 22 Q58 18 57 8Z" fill="url(#dots)" />
          <path d="M80 34 Q87 33 90 38 Q88 43 82 42Z" fill="url(#dots)" />
        </svg>
        {MAP.map(([sym, x, y]) => {
          const r = rows.get(sym);
          if (!r) return null;
          return (
            <Link
              key={sym}
              href={instrumentPath(r.i)}
              className="absolute flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1 text-[11px] shadow-sm hover:shadow-md"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
            >
              <span className="font-semibold">{r.i.ticker}</span>
              <span className={trendClass(r.q?.changePct)}>{pct(r.q?.changePct)}</span>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <IndexTable title="Nordiska index" list={NORDIC} rows={rows} />
          <IndexTable title="Råvaror" list={COMMOD} rows={rows} col="Råvara" />
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
              <h2 className="font-semibold">Nyheter</h2>
              <Link href="/info/nyheter" className="text-xs text-brand">
                Alla
              </Link>
            </div>
            <ul className="divide-y divide-border border-t border-border">
              {news.slice(0, 7).map((n) => (
                <li key={n.id}>
                  <a href={n.link} target="_blank" rel="noreferrer noopener" className="block px-4 py-2.5 hover:bg-surface-2">
                    <span className="text-[11px] text-muted">
                      {n.publisher} · {relativeSv(n.time)}
                    </span>
                    <span className="block text-[13px] font-medium">{n.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="space-y-5">
          <IndexTable title="Världsindex" list={WORLD} rows={rows} />
          <IndexTable title="Valutor" list={FX} rows={rows} decimals={4} col="Valuta" />
          <Movers title="Vinnare" list={winners} />
        </div>
        <div className="space-y-5">
          <IndexTable title="Europeiska index" list={EUROPE} rows={rows} />
          <IndexTable title="Räntor" subtitle="Amerikanska statsräntor" list={RATES} rows={rows} decimals={3} col="Ränta" />
          <Movers title="Förlorare" list={losers} />
          <section className="card overflow-hidden">
            <div className="px-4 pt-3.5 pb-2">
              <h2 className="font-semibold">Företagskalender</h2>
              <p className="text-xs text-muted">Kommande händelser, största bolagen</p>
            </div>
            <ul className="divide-y divide-border border-t border-border text-[13px]">
              {events.length === 0 ? <li className="px-4 py-3 text-muted">Inga kommande händelser.</li> : null}
              {events.slice(0, 10).map((e, i) => (
                <li key={i}>
                  <Link href={e.href} className="flex justify-between gap-2 px-4 py-2 hover:bg-surface-2">
                    <span>
                      <span className="block font-medium">{e.name.replace(/\s*\(publ\)/, "")}</span>
                      <span className="text-xs text-muted">{e.kind}</span>
                    </span>
                    <span className="tabular-nums text-muted">{dateSv(e.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          {omx ? (
            <section className="card p-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold">OMXS30</h2>
                <span className={trendClass(omx.q?.changePct)}>{pct(omx.q?.changePct)}</span>
              </div>
              <PriceChart symbol="^OMX" prevClose={omx.q?.prevClose} height={160} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
