import { Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listTransactions } from "@/lib/transactions";
import { Card, Empty } from "@/components/ui";
import { MinEkonomiTabs } from "@/components/min-ekonomi-tabs";
import { TxTable } from "@/components/tx-table";

export const metadata = { title: "Transaktioner" };

export default async function Transactions({ searchParams }: PageProps<"/min-ekonomi/transaktioner">) {
  const sp = await searchParams;
  const user = await requireUser();
  const s = (k: string) => (typeof sp[k] === "string" && sp[k] ? (sp[k] as string) : undefined);
  const f = { accountId: s("konto"), type: s("typ"), from: s("fran"), to: s("till") };
  const { rows, accounts } = await listTransactions(user.id, f);
  const qs = new URLSearchParams(Object.entries({ konto: f.accountId, typ: f.type, fran: f.from, till: f.to }).filter(([, v]) => v) as [string, string][]);
  return (
    <div>
      <MinEkonomiTabs active="transaktioner" />
      <form className="card mb-4 grid gap-3 p-4 sm:grid-cols-5">
        <label>
          <span className="label">Konto</span>
          <select name="konto" defaultValue={f.accountId ?? ""} className="input">
            <option value="">Alla konton</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.accountNumber})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Typ</span>
          <select name="typ" defaultValue={f.type ?? ""} className="input">
            <option value="">Alla</option>
            <option value="TRADES">Köp & sälj</option>
            <option value="MONEY">Insättningar, uttag & överföringar</option>
            <option value="OTHER">Utdelning, ränta, skatt & avgifter</option>
          </select>
        </label>
        <label>
          <span className="label">Från</span>
          <input type="date" name="fran" defaultValue={f.from} className="input" />
        </label>
        <label>
          <span className="label">Till</span>
          <input type="date" name="till" defaultValue={f.to} className="input" />
        </label>
        <div className="flex items-end gap-2">
          <button className="btn-primary flex-1">Filtrera</button>
          <a href={`/api/transactions/export?${qs}`} className="btn-secondary" title="Exportera till CSV (Excel)">
            <Download className="h-4 w-4" />
          </a>
        </div>
      </form>
      <Card>{rows.length ? <div className="pt-1"><TxTable rows={rows} /></div> : <Empty title="Inga transaktioner" />}</Card>
    </div>
  );
}
