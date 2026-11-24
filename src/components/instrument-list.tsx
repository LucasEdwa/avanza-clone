import Link from "next/link";
import type { Row } from "@/lib/market/lists";
import { compact, num, pct, price, trendClass } from "@/lib/format";
import { cn, instrumentPath } from "@/lib/utils";
import { InstrumentAvatar } from "@/components/ui";

export type Col = "last" | "changePct" | "volume" | "turnover" | "marketCap" | "pe" | "dividendYield" | "owners" | "high52" | "fee" | "risk" | "ytd";

const COLS: Record<Col, { label: string; render: (r: Row) => React.ReactNode; cls?: (r: Row) => string }> = {
  last: { label: "Senast", render: (r) => <>{price(r.quote?.last)} {r.currency !== "SEK" ? <span className="text-xs text-muted">{r.currency}</span> : null}</> },
  changePct: { label: "Idag %", render: (r) => pct(r.quote?.changePct), cls: (r) => trendClass(r.quote?.changePct) },
  volume: { label: "Omsatt antal", render: (r) => compact(r.quote?.volume) },
  turnover: { label: "Omsättning", render: (r) => compact((r.quote?.volume ?? 0) * (r.quote?.last ?? 0)) },
  marketCap: { label: "Börsvärde", render: (r) => compact(r.quote?.marketCap) },
  pe: { label: "P/E", render: (r) => num(r.quote?.pe, 1) },
  dividendYield: { label: "Dir.avk.", render: (r) => (r.quote?.dividendYield != null ? pct(r.quote.dividendYield, 2, false) : "–") },
  owners: { label: "Ägare", render: (r) => num(r.owners, 0) },
  high52: { label: "52v högst", render: (r) => price(r.quote?.high52) },
  fee: { label: "Avgift", render: (r) => (r.fundFee != null ? `${num(r.fundFee, 2)} %` : "–") },
  risk: { label: "Risk", render: (r) => r.fundRisk ?? "–" },
  ytd: { label: "I år", render: (r) => (r.quote?.ytdReturn != null ? pct(r.quote.ytdReturn) : "–"), cls: (r) => trendClass(r.quote?.ytdReturn) },
};

export function InstrumentList({ rows, cols, sortHref, sort, sub }: { rows: Row[]; cols: Col[]; sortHref?: (c: string) => string; sort?: string; sub?: (r: Row) => string | null }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>{sortHref ? <Link href={sortHref("name")}>Namn</Link> : "Namn"}</th>
            {cols.map((c) => (
              <th key={c} className="num">
                {sortHref ? (
                  <Link href={sortHref(c)} className={cn(sort?.replace("-", "") === c && "text-fg")}>
                    {COLS[c].label}
                    {sort === c ? " ↑" : sort === `-${c}` ? " ↓" : ""}
                  </Link>
                ) : (
                  COLS[c].label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="max-w-[18rem]">
                <Link href={instrumentPath(r)} className="flex items-center gap-2.5 hover:text-brand">
                  <InstrumentAvatar name={r.name} size={28} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{r.name}</span>
                    <span className="block text-xs text-muted">{sub ? sub(r) : r.ticker}</span>
                  </span>
                </Link>
              </td>
              {cols.map((c) => (
                <td key={c} className={cn("num", COLS[c].cls?.(r))}>
                  {COLS[c].render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function sortRows(rows: Row[], sort: string) {
  const desc = sort.startsWith("-");
  const key = sort.replace("-", "");
  const val = (r: Row): number | string => {
    switch (key) {
      case "name":
        return r.name;
      case "last":
        return r.quote?.last ?? -Infinity;
      case "changePct":
        return r.quote?.changePct ?? -Infinity;
      case "volume":
        return r.quote?.volume ?? -Infinity;
      case "turnover":
        return (r.quote?.volume ?? 0) * (r.quote?.last ?? 0);
      case "marketCap":
        return r.quote?.marketCap ?? -Infinity;
      case "pe":
        return r.quote?.pe ?? Infinity;
      case "dividendYield":
        return r.quote?.dividendYield ?? -Infinity;
      case "owners":
        return r.owners;
      case "fee":
        return r.fundFee ?? Infinity;
      case "risk":
        return r.fundRisk ?? 0;
      case "ytd":
        return r.quote?.ytdReturn ?? -Infinity;
      default:
        return r.quote?.marketCap ?? 0;
    }
  };
  return [...rows].sort((a, b) => {
    const x = val(a);
    const y = val(b);
    const c = typeof x === "string" ? x.localeCompare(String(y), "sv") : (x as number) - (y as number);
    return desc ? -c : c;
  });
}
