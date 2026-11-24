"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Eye, EyeOff } from "lucide-react";
import { createAlert, toggleWatch } from "@/app/actions/watch";
import { num } from "@/lib/format";

export function WatchButton({ instrumentId, lists }: { instrumentId: number; lists: { id: string; name: string; has: boolean }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const any = lists.some((l) => l.has);
  return (
    <div ref={ref} className="relative">
      <button className="btn-secondary" onClick={() => setOpen(!open)}>
        {any ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {any ? "Bevakas" : "Bevaka"}
      </button>
      {open ? (
        <div className="card absolute right-0 z-30 mt-2 w-60 p-2 shadow-xl">
          {lists.map((l) => (
            <label key={l.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">
              <input
                type="checkbox"
                defaultChecked={l.has}
                onChange={(e) =>
                  start(async () => {
                    await toggleWatch(l.id, instrumentId, e.target.checked);
                    router.refresh();
                  })
                }
              />
              {l.name}
            </label>
          ))}
          {!lists.length ? <p className="p-2 text-sm text-muted">Skapa en lista under Bevakningar.</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export function AlertButton({ instrumentId, last }: { instrumentId: number; last: number | null }) {
  const [open, setOpen] = useState(false);
  const [dir, setDir] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [price, setPrice] = useState(last ? num(last * 1.05, 2).replace(/\s/g, "") : "");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div className="relative">
      <button className="btn-secondary" onClick={() => setOpen(!open)} title="Kursvarning">
        <Bell className="h-4 w-4" /> <span className="hidden sm:inline">Kursvarning</span>
      </button>
      {open ? (
        <div className="card absolute right-0 z-30 mt-2 w-64 space-y-2 p-3 shadow-xl">
          <div className="text-sm font-semibold">Ny kursvarning</div>
          <select className="input" value={dir} onChange={(e) => setDir(e.target.value as "ABOVE" | "BELOW")}>
            <option value="ABOVE">Kursen stiger över</option>
            <option value="BELOW">Kursen sjunker under</option>
          </select>
          <input className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
          {msg ? <p className="text-xs text-pos">{msg}</p> : null}
          <button
            className="btn-primary w-full"
            onClick={async () => {
              const r = await createAlert(instrumentId, dir, Number(price.replace(",", ".")));
              setMsg(r.error ?? "Kursvarning skapad. Du får en notis när den utlöses.");
              router.refresh();
            }}
          >
            Skapa
          </button>
        </div>
      ) : null}
    </div>
  );
}
