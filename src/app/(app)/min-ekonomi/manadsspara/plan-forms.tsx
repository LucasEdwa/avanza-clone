"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Trash2, Zap, X } from "lucide-react";
import { createPlan, deletePlan, runPlanNow, setPlanActive } from "@/app/actions/savings";
import { Notice } from "@/components/ui";

export function PlanActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn();
      router.refresh();
    });
  return (
    <div className="flex gap-1">
      <button className="btn-secondary px-3 py-1.5" disabled={pending} onClick={() => run(() => runPlanNow(id))} title="Genomför nu (demo)">
        <Zap className="h-4 w-4" /> Kör nu
      </button>
      <button className="btn-ghost px-2" disabled={pending} onClick={() => run(() => setPlanActive(id, !active))} title={active ? "Pausa" : "Återuppta"}>
        {active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button className="btn-ghost px-2 text-neg" disabled={pending} onClick={() => confirm("Avsluta månadssparandet?") && run(() => deletePlan(id))} title="Avsluta">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function NewPlan({ accounts, banks, funds }: { accounts: { id: string; name: string }[]; banks: { id: string; name: string }[]; funds: { id: number; name: string }[] }) {
  const router = useRouter();
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [bankAccountId, setBank] = useState(banks[0]?.id ?? "");
  const [amount, setAmount] = useState("1000");
  const [day, setDay] = useState("25");
  const [alloc, setAlloc] = useState<{ instrumentId: number; pct: number }[]>([]);
  const [res, setRes] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [pending, start] = useTransition();
  const total = alloc.reduce((s, a) => s + a.pct, 0);
  if (!banks.length) return <Notice kind="warn">Koppla ett bankkonto under Profil först.</Notice>;
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="label">Belopp per månad (kr)</span>
        <input className="input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="label">Dragningsdag</span>
          <select className="input" value={day} onChange={(e) => setDay(e.target.value)}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Till konto</span>
          <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="label">Dras från (autogiro)</span>
        <select className="input" value={bankAccountId} onChange={(e) => setBank(e.target.value)}>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label">Lägg till fond</span>
        <select
          className="input"
          value=""
          onChange={(e) => {
            const id = Number(e.target.value);
            if (!id || alloc.some((a) => a.instrumentId === id)) return;
            const next = [...alloc, { instrumentId: id, pct: 0 }];
            const even = Math.floor(100 / next.length);
            setAlloc(next.map((a, i) => ({ ...a, pct: i === 0 ? 100 - even * (next.length - 1) : even })));
          }}
        >
          <option value="">Välj fond…</option>
          {funds.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
      {alloc.map((a) => (
        <div key={a.instrumentId} className="flex items-center gap-2 text-sm">
          <span className="flex-1 truncate">{funds.find((f) => f.id === a.instrumentId)?.name}</span>
          <input className="input w-16 py-1 text-right" inputMode="numeric" value={a.pct} onChange={(e) => setAlloc(alloc.map((x) => (x.instrumentId === a.instrumentId ? { ...x, pct: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)))} />
          <span>%</span>
          <button className="text-muted" onClick={() => setAlloc(alloc.filter((x) => x.instrumentId !== a.instrumentId))} aria-label="Ta bort">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      {alloc.length ? <div className={total === 100 ? "text-xs text-muted" : "text-xs text-neg"}>Summa {total} % (måste vara 100 %)</div> : null}
      {res?.error ? <Notice kind="error">{res.error}</Notice> : res?.ok ? <Notice kind="success">Månadssparandet är startat.</Notice> : null}
      <button
        className="btn-primary w-full"
        disabled={pending || total !== 100}
        onClick={() =>
          start(async () => {
            const r = await createPlan({ accountId, bankAccountId, amount: Number(amount), dayOfMonth: Number(day), allocations: alloc });
            setRes(r);
            if (r.ok) {
              setAlloc([]);
              router.refresh();
            }
          })
        }
      >
        Starta månadssparande
      </button>
    </div>
  );
}
