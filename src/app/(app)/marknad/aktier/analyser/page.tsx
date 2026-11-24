import Link from "next/link";
import { Lock } from "lucide-react";
import { getUser } from "@/lib/auth";
import { AKTIE_TABS, HandlaTabs } from "@/components/handla/common";
import { listInstruments } from "@/lib/market/lists";
import { getProfile } from "@/lib/market/data";
import { num, pct, price, trendClass } from "@/lib/format";
import { cn, instrumentPath } from "@/lib/utils";

export const metadata = { title: "Externa analyser" };

const REC: Record<string, [string, string]> = {
  strong_buy: ["Starkt köp", "bg-pos-soft text-pos"],
  buy: ["Köp", "bg-pos-soft text-pos"],
  hold: ["Behåll", "bg-surface-2 text-fg"],
  underperform: ["Underprestera", "bg-neg-soft text-neg"],
  sell: ["Sälj", "bg-neg-soft text-neg"],
};

export default async function Analyses() {
  const user = await getUser();
  if (!user)
    return (
      <div className="mx-auto max-w-6xl">
        <HandlaTabs title="Handla aktier" tabs={AKTIE_TABS} active="analyser" />
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span className="flex h-28 w-28 items-center justify-center rounded-full bg-mint">
            <Lock className="h-10 w-10 text-pos" />
          </span>
          <h2 className="mt-5 text-lg font-bold">Denna information kräver inloggning</h2>
          <p className="mt-1 text-sm text-muted">Logga in för att se analytikernas rekommendationer och riktkurser.</p>
          <Link href="/logga-in?next=/marknad/aktier/analyser" className="btn mt-5 bg-[#11142a] px-6 text-white dark:bg-white dark:text-[#11142a]">
            Logga in
          </Link>
        </div>
      </div>
    );

  const stocks = (await listInstruments(["STOCK"])).sort((a, b) => (b.quote?.marketCap ?? 0) - (a.quote?.marketCap ?? 0)).slice(0, 40);
  const profiles = new Map<number, Awaited<ReturnType<typeof getProfile>>>();
  let i = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (i < stocks.length) {
        const s = stocks[i++];
        profiles.set(s.id, await getProfile(s.symbol, "STOCK").catch(() => null));
      }
    }),
  );
  const rows = stocks
    .map((s) => ({ s, p: profiles.get(s.id) }))
    .filter((r) => r.p?.recommendation && r.p.recommendation !== "none")
    .map((r) => ({ ...r, upside: r.p?.targetPrice && r.s.quote?.last ? (r.p.targetPrice / r.s.quote.last - 1) * 100 : null }))
    .sort((a, b) => (b.upside ?? -999) - (a.upside ?? -999));

  return (
    <div className="mx-auto max-w-6xl">
      <HandlaTabs title="Handla aktier" tabs={AKTIE_TABS} active="analyser" />
      <p className="mb-4 text-sm text-muted">Sammanställning av analytikers rekommendationer och genomsnittlig riktkurs för de största bolagen. Källa: Yahoo Finance. Analyser är bedömningar, inte råd.</p>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Bolag</th>
              <th>Rekommendation</th>
              <th className="num">Senast</th>
              <th className="num">Riktkurs</th>
              <th className="num">Potential</th>
              <th className="num">Analytiker</th>
              <th>Nästa rapport</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, p, upside }) => (
              <tr key={s.id}>
                <td>
                  <Link href={instrumentPath(s)} className="font-medium text-brand hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td>
                  <span className={cn("badge", REC[p!.recommendation!]?.[1] ?? "bg-surface-2")}>{REC[p!.recommendation!]?.[0] ?? p!.recommendation}</span>
                </td>
                <td className="num">
                  {price(s.quote?.last)} {s.currency}
                </td>
                <td className="num">{price(p?.targetPrice)}</td>
                <td className={cn("num", trendClass(upside))}>{pct(upside)}</td>
                <td className="num">{num(p?.analysts, 0)}</td>
                <td className="text-muted">{p?.earningsDate ?? "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
