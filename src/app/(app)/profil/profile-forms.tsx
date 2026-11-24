"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Moon, Sun } from "lucide-react";
import { setCourtageClass, setTheme, updateContact } from "@/app/actions/profile";
import { COURTAGE_CLASSES, type CourtageClass } from "@/lib/courtage";
import { Notice } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ContactForm({ initial }: { initial: Record<"email" | "phone" | "street" | "postalCode" | "city", string> }) {
  const [v, setV] = useState(initial);
  const [res, setRes] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setRes(await updateContact(v)));
      }}
    >
      {(
        [
          ["email", "E-post"],
          ["phone", "Mobilnummer"],
          ["street", "Gatuadress"],
          ["postalCode", "Postnummer"],
          ["city", "Ort"],
        ] as const
      ).map(([k, l]) => (
        <label key={k} className={k === "email" || k === "street" ? "sm:col-span-2" : ""}>
          <span className="label">{l}</span>
          <input className="input" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
        </label>
      ))}
      <div className="sm:col-span-2">{res ? <Notice kind={res.error ? "error" : "success"}>{res.error ?? "Uppgifterna är sparade."}</Notice> : null}</div>
      <button className="btn-primary sm:col-span-2" disabled={pending}>
        Spara
      </button>
    </form>
  );
}

export function CourtagePicker({ current }: { current: CourtageClass }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-5">
        {(Object.keys(COURTAGE_CLASSES) as CourtageClass[]).map((k) => {
          const c = COURTAGE_CLASSES[k];
          return (
            <button
              key={k}
              disabled={pending || (k === "START" && current !== "START")}
              onClick={() =>
                start(async () => {
                  const r = await setCourtageClass(k);
                  setErr(r.error ?? null);
                  router.refresh();
                })
              }
              className={cn("rounded-xl border p-3 text-left disabled:opacity-40", current === k ? "border-brand bg-brand-soft" : "border-border hover:bg-surface-2")}
            >
              <div className="font-semibold">{c.label}</div>
              <div className="mt-1 text-xs text-muted">{c.description}</div>
            </button>
          );
        })}
      </div>
      {err ? <p className="mt-2 text-sm text-neg">{err}</p> : null}
    </div>
  );
}

export function ThemePicker({ current }: { current: "light" | "dark" | "system" }) {
  const [t, setT] = useState(current);
  const apply = (v: typeof t) => {
    setT(v);
    const dark = v === "dark" || (v === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    setTheme(v);
  };
  return (
    <div className="grid grid-cols-3 gap-2">
      {(
        [
          ["light", "Ljust", Sun],
          ["dark", "Mörkt", Moon],
          ["system", "System", Monitor],
        ] as const
      ).map(([k, l, I]) => (
        <button key={k} onClick={() => apply(k)} className={cn("flex flex-col items-center gap-1 rounded-xl border p-3 text-sm", t === k ? "border-brand bg-brand-soft" : "border-border hover:bg-surface-2")}>
          <I className="h-5 w-5" /> {l}
        </button>
      ))}
    </div>
  );
}
