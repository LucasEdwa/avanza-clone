import Link from "next/link";
import type { Account, Instrument, Transaction } from "@/db/schema";
import { dateSv, num, price, sek, trendClass } from "@/lib/format";
import { cn, instrumentPath, TX_TYPE_LABEL } from "@/lib/utils";

export function TxTable({ rows, showAccount = true }: { rows: { t: Transaction; i: Instrument | null; a: Account }[]; showAccount?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Datum</th>
            {showAccount ? <th>Konto</th> : null}
            <th>Typ</th>
            <th>Beskrivning</th>
            <th className="num">Antal</th>
            <th className="num">Kurs</th>
            <th className="num">Courtage</th>
            <th className="num">Belopp</th>
            <th className="num">Resultat</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ t, i, a }) => (
            <tr key={t.id}>
              <td className="text-muted">{dateSv(t.bookedAt)}</td>
              {showAccount ? <td className="text-muted">{a.name}</td> : null}
              <td>
                <span
                  className={cn(
                    "badge",
                    t.type === "BUY" ? "bg-pos-soft text-pos" : t.type === "SELL" ? "bg-neg-soft text-neg" : "bg-surface-2 text-muted",
                  )}
                >
                  {TX_TYPE_LABEL[t.type]}
                </span>
              </td>
              <td className="max-w-[18rem] truncate">
                {i ? (
                  <Link href={instrumentPath(i)} className="hover:text-brand">
                    {i.name}
                  </Link>
                ) : (
                  t.description
                )}
              </td>
              <td className="num">{t.quantity != null ? num(t.quantity, 0, 4) : ""}</td>
              <td className="num">{t.price != null ? `${price(t.price)}${t.currency !== "SEK" ? ` ${t.currency}` : ""}` : ""}</td>
              <td className="num text-muted">{t.courtage + t.fxFee ? num(t.courtage + t.fxFee, 2) : ""}</td>
              <td className={cn("num font-medium", trendClass(t.amount))}>{sek(t.amount)}</td>
              <td className={cn("num", trendClass(t.realizedGain))}>{t.realizedGain != null ? num(t.realizedGain, 0) : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
