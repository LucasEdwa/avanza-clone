"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { MoneyData } from "@/lib/money-data";
import { deposit, transfer, withdraw } from "@/app/actions/money";
import { SignDialog } from "@/components/bankid/sign-dialog";
import { Notice } from "@/components/ui";
import { sek } from "@/lib/format";

const parse = (s: string) => Number(s.replace(/\s/g, "").replace(",", "."));

function AccountSelect({ accounts, value, onChange, label, showBp = true }: { accounts: MoneyData["accounts"]; value: string; onChange: (v: string) => void; label: string; showBp?: boolean }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.number}){showBp ? ` · ${sek(a.buyingPower)}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

function NoBank() {
  return (
    <Notice kind="warn">
      Du har inget kopplat bankkonto. <Link href="/profil/bankkonton" className="underline">Koppla ett bankkonto</Link> först.
    </Notice>
  );
}

function Feedback({ res }: { res: { error?: string; message?: string } | null }) {
  if (!res) return null;
  return <Notice kind={res.error ? "error" : "success"}>{res.error ?? res.message}</Notice>;
}

export function DepositForm({ data, initialAccount }: { data: MoneyData; initialAccount?: string }) {
  const router = useRouter();
  const [acc, setAcc] = useState(initialAccount ?? data.accounts[0]?.id ?? "");
  const [bank, setBank] = useState(data.banks[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [res, setRes] = useState<{ error?: string; message?: string } | null>(null);
  const [pending, start] = useTransition();
  if (!data.banks.length) return <NoBank />;
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await deposit(acc, bank, parse(amount));
          setRes(r);
          if (r.ok) {
            setAmount("");
            router.refresh();
          }
        });
      }}
    >
      <label className="block">
        <span className="label">Från bankkonto</span>
        <select className="input" value={bank} onChange={(e) => setBank(e.target.value)}>
          {data.banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </label>
      <AccountSelect accounts={data.accounts} value={acc} onChange={setAcc} label="Till konto" showBp={false} />
      <label className="block">
        <span className="label">Belopp (kr)</span>
        <input className="input text-lg" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
      </label>
      <div className="flex flex-wrap gap-2">
        {[1000, 5000, 10000, 50000].map((v) => (
          <button type="button" key={v} className="chip" onClick={() => setAmount(String(v))}>
            {sek(v, 0)}
          </button>
        ))}
      </div>
      <Feedback res={res} />
      <button className="btn-primary w-full" disabled={pending || !(parse(amount) > 0)}>
        Sätt in direkt
      </button>
      <p className="text-xs text-muted">Direktinsättning via din bank. Pengarna blir tillgängliga direkt (simulerat).</p>
    </form>
  );
}

export function WithdrawForm({ data, initialAccount }: { data: MoneyData; initialAccount?: string }) {
  const router = useRouter();
  const [acc, setAcc] = useState(initialAccount ?? data.accounts[0]?.id ?? "");
  const [bank, setBank] = useState(data.banks[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [signing, setSigning] = useState(false);
  const [res, setRes] = useState<{ error?: string; message?: string } | null>(null);
  const a = data.accounts.find((x) => x.id === acc);
  const req = useMemo(() => ({ action: "withdrawal" as const, accountId: acc, bankAccountId: bank, amount: Math.round(parse(amount) * 100) / 100 }), [acc, bank, amount]);
  if (!data.banks.length) return <NoBank />;
  const valid = parse(amount) > 0 && a && parse(amount) <= a.buyingPower;
  return (
    <div className="space-y-4">
      <AccountSelect accounts={data.accounts} value={acc} onChange={setAcc} label="Från konto" />
      <label className="block">
        <span className="label">Till bankkonto</span>
        <select className="input" value={bank} onChange={(e) => setBank(e.target.value)}>
          {data.banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label">Belopp (kr) · tillgängligt för uttag {sek(a?.buyingPower ?? 0)}</span>
        <input className="input text-lg" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
      </label>
      <button type="button" className="chip" onClick={() => setAmount(String(a?.buyingPower ?? 0).replace(".", ","))}>
        Hela beloppet
      </button>
      <Feedback res={res} />
      <button className="btn-primary w-full" disabled={!valid} onClick={() => setSigning(true)}>
        Skriv under med BankID
      </button>
      <p className="text-xs text-muted">Uttag signeras med BankID och betalas ut inom 1–2 bankdagar.</p>
      {signing ? (
        <SignDialog
          request={req}
          title={`Godkänn uttag av ${sek(req.amount)}.`}
          onClose={() => setSigning(false)}
          onSigned={async (orderRef) => {
            const r = await withdraw(orderRef, req);
            setSigning(false);
            setRes(r);
            if (r.ok) {
              setAmount("");
              router.refresh();
            }
          }}
        />
      ) : null}
    </div>
  );
}

export function TransferForm({ data }: { data: MoneyData }) {
  const router = useRouter();
  const [from, setFrom] = useState(data.accounts[0]?.id ?? "");
  const [to, setTo] = useState(data.accounts[1]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [res, setRes] = useState<{ error?: string; message?: string } | null>(null);
  const [pending, start] = useTransition();
  if (data.accounts.length < 2) return <Notice>Du behöver minst två konton. <Link className="underline" href="/min-ekonomi/oppna-konto">Öppna konto</Link>.</Notice>;
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await transfer(from, to, parse(amount));
          setRes(r);
          if (r.ok) {
            setAmount("");
            router.refresh();
          }
        });
      }}
    >
      <AccountSelect accounts={data.accounts} value={from} onChange={setFrom} label="Från konto" />
      <AccountSelect accounts={data.accounts} value={to} onChange={setTo} label="Till konto" showBp={false} />
      <label className="block">
        <span className="label">Belopp (kr)</span>
        <input className="input text-lg" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
      </label>
      <Feedback res={res} />
      <button className="btn-primary w-full" disabled={pending || !(parse(amount) > 0) || from === to}>
        För över
      </button>
      <p className="text-xs text-muted">Överföringar mellan egna konton sker direkt. Notera att överföring från ISK räknas som uttag.</p>
    </form>
  );
}
