"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { addBankAccount, removeBankAccount } from "@/app/actions/money";
import { SignDialog } from "@/components/bankid/sign-dialog";
import { Notice } from "@/components/ui";

const BANKS: [string, RegExp][] = [
  ["Swedbank", /^(7[0-9]{3}|8[0-9]{4})$/],
  ["Handelsbanken", /^6[0-9]{3}$/],
  ["SEB", /^5[0-9]{3}$/],
  ["Nordea", /^(1[1-9][0-9]{2}|3[0-9]{3}|4[0-9]{3})$/],
  ["Danske Bank", /^12[0-9]{2}$/],
  ["Länsförsäkringar Bank", /^90[2-3][0-9]$/],
  ["ICA Banken", /^927[0-9]$/],
  ["Skandiabanken", /^91[5-6][0-9]$/],
];

export function AddBankAccount() {
  const router = useRouter();
  const [clearing, setClearing] = useState("");
  const [number, setNumber] = useState("");
  const [signing, setSigning] = useState(false);
  const [res, setRes] = useState<{ ok?: boolean; error?: string; message?: string } | null>(null);
  const bankName = BANKS.find(([, re]) => re.test(clearing))?.[0] ?? (clearing.length >= 4 ? "Övrig bank" : "");
  const valid = /^\d{4,5}$/.test(clearing) && /^\d{5,15}$/.test(number);
  const req = { action: "add-bank-account" as const, bankName, clearing, accountNumber: number };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <label>
          <span className="label">Clearingnr</span>
          <input className="input" inputMode="numeric" value={clearing} onChange={(e) => setClearing(e.target.value.replace(/\D/g, "").slice(0, 5))} />
        </label>
        <label className="col-span-2">
          <span className="label">Kontonummer</span>
          <input className="input" inputMode="numeric" value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 15))} />
        </label>
      </div>
      {bankName ? <p className="text-sm text-muted">Bank: {bankName}</p> : null}
      {res ? <Notice kind={res.error ? "error" : "success"}>{res.error ?? res.message}</Notice> : null}
      <button className="btn-primary" disabled={!valid} onClick={() => setSigning(true)}>
        Koppla med BankID
      </button>
      {signing ? (
        <SignDialog
          request={req}
          title={`Bekräfta att ${bankName} ${clearing}-${number} tillhör dig.`}
          onClose={() => setSigning(false)}
          onSigned={async (orderRef) => {
            const r = await addBankAccount(orderRef, req);
            setSigning(false);
            setRes(r);
            if (r.ok) {
              setClearing("");
              setNumber("");
              router.refresh();
            }
          }}
        />
      ) : null}
    </div>
  );
}

export function RemoveBank({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      className="btn-ghost px-2 text-neg"
      aria-label="Ta bort"
      onClick={async () => {
        if (!confirm("Ta bort bankkontot?")) return;
        await removeBankAccount(id);
        router.refresh();
      }}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
