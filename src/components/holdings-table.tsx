import Link from "next/link";
import type { HoldingRow } from "@/lib/portfolio";
import { num, pct, price, sek, trendClass } from "@/lib/format";
import { cn, instrumentPath, INSTRUMENT_TYPE_LABEL } from "@/lib/utils";
import { InstrumentAvatar } from "@/components/ui";

export function HoldingsTable({ rows, showAccount = false, compact = false }: { rows: HoldingRow[]; showAccount?: boolean; compact?: boolean }) {
  const groups = compact ? [["", rows] as const] : (["STOCK", "ETF", "FUND"] as const).map((t) => [t, rows.filter((r) => r.instrument.type === t)] as const).filter(([, r]) => r.length);
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Namn</th>
            {showAccount ? <th>Konto</th> : null}
            {!compact ? <th className="num">Antal</th> : null}
            {!compact ? <th className="num">GAV</th> : null}
            <th className="num">Senast</th>
            <th className="num">Idag %</th>
            {!compact ? <th className="num">Idag kr</th> : null}
            <th className="num">Värde</th>
            <th className="num">Avkastning</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(([type, list]) => (
            <GroupRows key={type || "all"} type={type} list={list} showAccount={showAccount} compact={compact} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupRows({ type, list, showAccount, compact }: { type: string; list: readonly HoldingRow[]; showAccount: boolean; compact: boolean }) {
  const total = list.reduce((s, r) => s + r.valueSek, 0);
  return (
    <>
      {type ? (
        <tr className="!bg-transparent">
          <td colSpan={20} className="bg-surface-2 !py-1.5 text-xs font-semibold text-muted">
            {INSTRUMENT_TYPE_LABEL[type]}er · {sek(total, 0)}
          </td>
        </tr>
      ) : null}
      {list.map((r) => (
        <tr key={`${r.accountId}-${r.instrument.id}`}>
          <td className="max-w-[16rem]">
            <Link href={instrumentPath(r.instrument)} className="flex items-center gap-2.5 hover:text-brand">
              <InstrumentAvatar name={r.instrument.name} size={28} />
              <span className="truncate font-medium">{r.instrument.name}</span>
            </Link>
          </td>
          {showAccount ? <td className="text-muted">{r.accountName}</td> : null}
          {!compact ? <td className="num">{num(r.quantity, 0, r.instrument.type === "FUND" ? 4 : 0)}</td> : null}
          {!compact ? <td className="num">{price(r.avgPrice)}</td> : null}
          <td className="num">
            {price(r.last)} {r.instrument.currency !== "SEK" ? <span className="text-xs text-muted">{r.instrument.currency}</span> : null}
          </td>
          <td className={cn("num", trendClass(r.changePct))}>{pct(r.changePct)}</td>
          {!compact ? <td className={cn("num", trendClass(r.todaySek))}>{num(r.todaySek, 0)}</td> : null}
          <td className="num font-medium">{sek(r.valueSek, 0)}</td>
          <td className={cn("num", trendClass(r.gainSek))}>
            <div>{pct(r.gainPct)}</div>
            {!compact ? <div className="text-xs">{num(r.gainSek, 0)} kr</div> : null}
          </td>
        </tr>
      ))}
    </>
  );
}
