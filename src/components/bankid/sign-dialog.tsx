"use client";

import { useCallback } from "react";
import { X } from "lucide-react";
import { BankIdBadge, BankIdFlow } from "./bankid-flow";

export type SignRequestBody = Record<string, unknown> & { action: string };

export function SignDialog({
  request,
  title,
  onSigned,
  onClose,
}: {
  request: SignRequestBody;
  title: string;
  onSigned: (orderRef: string) => Promise<void>;
  onClose: () => void;
}) {
  const start = useCallback(async () => {
    const r = await fetch("/api/bankid/sign", { method: "POST", body: JSON.stringify(request) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error ?? "Kunde inte starta BankID");
    return j;
  }, [request]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal>
      <div className="card w-full max-w-sm rounded-b-none p-5 sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <BankIdBadge /> Skriv under
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-surface-2" aria-label="Stäng">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-muted">{title}</p>
        <BankIdFlow intent="sign" start={start} onComplete={onSigned} onCancel={onClose} />
      </div>
    </div>
  );
}
