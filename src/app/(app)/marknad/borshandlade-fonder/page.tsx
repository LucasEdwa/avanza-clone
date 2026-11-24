import Link from "next/link";
import { RiskNotice } from "@/components/handla/common";
import { listInstruments } from "@/lib/market/lists";
import { getProfile } from "@/lib/market/data";
import { num, pct, price, trendClass } from "@/lib/format";
import { cn, instrumentPath } from "@/lib/utils";
import { FLAG } from "@/components/handla/common";

export const metadata = { title: "ETF – Börshandlade fonder" };

export default async function Etfs() {
  const rows = await listInstruments(["ETF"], undefined, { perf: true });
  const fees = new Map(await Promise.all(rows.map(async (r) => [r.id, (await getProfile(r.symbol, "ETF").catch(() => null))?.expenseRatio ?? null] as const)));
  const sorted = [...rows].sort((a, b) => b.owners - a.owners || (b.perf?.y3 ?? -99) - (a.perf?.y3 ?? -99));
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 text-3xl font-bold tracking-tight">ETF – Börshandlade fonder</h1>
      <p className="mb-5 text-sm text-muted">Fonder som handlas på börsen som aktier. Courtage enligt din courtageklass.</p>
      <RiskNotice />
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Namn</th>
              <th className="num">Utv. idag</th>
              <th className="num">Utv. 1 år</th>
              <th className="num">Utv. 3 år</th>
              <th className="num">Senast</th>
              <th className="num">Direktavk.</th>
              <th className="num">Produktavg.</th>
              <th className="num">Antal ägare</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const fee = fees.get(r.id);
              return (
                <tr key={r.id}>
                  <td>
                    <Link href={instrumentPath(r)} className="flex items-center gap-2 text-brand hover:underline">
                      <span>{FLAG[r.country ?? ""] ?? "🏳️"}</span>
                      {r.name}
                    </Link>
                  </td>
                  <td className={cn("num", trendClass(r.quote?.changePct))}>{pct(r.quote?.changePct)}</td>
                  <td className={cn("num", trendClass(r.perf?.y1))}>{pct(r.perf?.y1)}</td>
                  <td className={cn("num", trendClass(r.perf?.y3))}>{pct(r.perf?.y3)}</td>
                  <td className="num">
                    {price(r.quote?.last)} {r.currency}
                  </td>
                  <td className="num">{r.quote?.dividendYield ? pct(r.quote.dividendYield, 2, false) : "0,00 %"}</td>
                  <td className="num">{fee != null ? `${num(fee * 100, 2)} %` : "–"}</td>
                  <td className="num">{num(r.owners, 0)} st</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
