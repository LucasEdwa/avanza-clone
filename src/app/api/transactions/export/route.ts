import { getUser } from "@/lib/auth";
import { listTransactions } from "@/lib/transactions";
import { TX_TYPE_LABEL } from "@/lib/utils";

const esc = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const n = (v: number | null | undefined) => (v == null ? "" : String(v).replace(".", ","));

export async function GET(req: Request) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const sp = new URL(req.url).searchParams;
  const { rows } = await listTransactions(user.id, {
    accountId: sp.get("konto") ?? undefined,
    type: sp.get("typ") ?? undefined,
    from: sp.get("fran") ?? undefined,
    to: sp.get("till") ?? undefined,
  }, 10000);
  const header = ["Datum", "Konto", "Typ av transaktion", "Värdepapper/beskrivning", "Antal", "Kurs", "Belopp", "Courtage", "Valutaavgift", "Valuta", "Växelkurs", "Resultat", "Likviddag", "ISIN/Symbol"];
  const lines = rows.map(({ t, i, a }) =>
    [
      t.bookedAt.toISOString().slice(0, 10),
      a.accountNumber,
      TX_TYPE_LABEL[t.type],
      i?.name ?? t.description,
      n(t.quantity),
      n(t.price),
      n(t.amount),
      n(t.courtage),
      n(t.fxFee),
      t.currency,
      n(t.fxRate),
      n(t.realizedGain),
      t.settleDate ?? "",
      i?.symbol ?? "",
    ]
      .map(esc)
      .join(";"),
  );
  const body = "﻿" + [header.join(";"), ...lines].join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transaktioner_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
