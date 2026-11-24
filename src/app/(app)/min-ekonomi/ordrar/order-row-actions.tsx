"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { cancelOrderAction, modifyOrderAction } from "@/app/actions/trading";

export function OrderRowActions({ id, editable, quantity, limitPrice, validUntil }: { id: string; editable: boolean; quantity: number; limitPrice: number; validUntil: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [edit, setEdit] = useState(false);
  const [q, setQ] = useState(String(quantity));
  const [p, setP] = useState(String(limitPrice).replace(".", ","));
  const [v, setV] = useState(validUntil);
  const [err, setErr] = useState<string | null>(null);

  if (edit)
    return (
      <div className="flex min-w-[22rem] items-center gap-1">
        <input className="input w-20 py-1" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Antal" />
        <input className="input w-24 py-1" value={p} onChange={(e) => setP(e.target.value)} aria-label="Pris" />
        <input className="input w-36 py-1" type="date" value={v} onChange={(e) => setV(e.target.value)} aria-label="Giltig till" />
        <button
          className="btn-primary px-3 py-1"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await modifyOrderAction(id, { quantity: Number(q), limitPrice: Number(p.replace(",", ".")), validUntil: v });
              if (r.error) setErr(r.error);
              else {
                setEdit(false);
                router.refresh();
              }
            })
          }
        >
          Spara
        </button>
        <button className="btn-ghost px-2 py-1" onClick={() => setEdit(false)}>
          <X className="h-4 w-4" />
        </button>
        {err ? <span className="text-xs text-neg">{err}</span> : null}
      </div>
    );

  return (
    <div className="flex justify-end gap-1">
      {editable ? (
        <button className="btn-ghost px-2 py-1" title="Ändra" onClick={() => setEdit(true)}>
          <Pencil className="h-4 w-4" />
        </button>
      ) : null}
      <button
        className="btn-ghost px-2 py-1 text-neg"
        disabled={pending}
        onClick={() =>
          confirm("Vill du makulera ordern?") &&
          start(async () => {
            const r = await cancelOrderAction(id);
            if (r.error) alert(r.error);
            router.refresh();
          })
        }
      >
        Makulera
      </button>
    </div>
  );
}
