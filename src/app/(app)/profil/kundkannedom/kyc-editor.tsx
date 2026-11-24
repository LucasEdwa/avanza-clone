"use client";

import { useState, useTransition } from "react";
import { KycForm } from "@/components/kyc-form";
import { updateKyc } from "@/app/actions/profile";
import { Notice } from "@/components/ui";

export function KycEditor({ initial }: { initial: Record<string, string | string[]> }) {
  const [v, setV] = useState(initial);
  const [res, setRes] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-5">
      <KycForm value={v} onChange={setV} />
      {res ? <Notice kind={res.error ? "error" : "success"}>{res.error ?? "Tack! Dina svar är sparade."}</Notice> : null}
      <button className="btn-primary" disabled={pending} onClick={() => start(async () => setRes(await updateKyc(v)))}>
        Spara svar
      </button>
    </div>
  );
}
