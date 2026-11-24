"use client";

import { useState } from "react";
import { num } from "@/lib/format";

const kr = (v: number) => `${num(Math.round(v), 0)} kr`;

/**
 * Mortgage calculator using Swedish rules: 10 % down payment (bolånetak 90 %),
 * debt-to-income cap ~5.5× gross annual income (bank practice) and the amortisation
 * requirements (1 % > 50 % LTV, 2 % > 70 % LTV, +1 % if debt > 4.5× income).
 */
export function LoanCalculator() {
  const [income, setIncome] = useState(45000);
  const [price, setPrice] = useState(3500000);
  const [cash, setCash] = useState(400000);
  const [other, setOther] = useState(0);
  const [rate, setRate] = useState(3.2);

  const annual = income * 12;
  const maxByIncome = Math.max(0, annual * 5.5 - other);
  const maxByPrice = price * 0.9;
  const loan = Math.max(0, Math.min(price - cash, maxByIncome, maxByPrice));
  const ltv = price ? loan / price : 0;
  let amortPct = ltv > 0.7 ? 2 : ltv > 0.5 ? 1 : 0;
  if (loan + other > annual * 4.5) amortPct += 1;
  const interestMonth = (loan * rate) / 100 / 12;
  const interestAfterTax = interestMonth * 0.7;
  const amortMonth = (loan * amortPct) / 100 / 12;
  const tooLittleCash = price - cash > Math.min(maxByIncome, maxByPrice);

  const field = (label: string, v: number, set: (n: number) => void, step = 1000) => (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input" type="number" step={step} min={0} value={v} onChange={(e) => set(Number(e.target.value) || 0)} />
    </label>
  );

  return (
    <div className="card grid gap-6 p-6 md:grid-cols-2">
      <div className="space-y-3">
        {field("Hushållets inkomst före skatt (kr/mån)", income, setIncome)}
        {field("Bostadens pris (kr)", price, setPrice, 50000)}
        {field("Kontantinsats (kr)", cash, setCash, 10000)}
        {field("Andra lån, t.ex. billån (kr)", other, setOther, 10000)}
        {field("Ränta (%)", rate, setRate, 0.05)}
      </div>
      <div className="rounded-2xl bg-mint p-5">
        <div className="text-sm text-muted">Du kan låna upp till</div>
        <div className="text-3xl font-bold tabular-nums">{kr(Math.min(maxByIncome, maxByPrice))}</div>
        <dl className="mt-5 space-y-2 text-sm">
          {[
            ["Lånebelopp för detta köp", kr(loan)],
            ["Belåningsgrad", `${num(ltv * 100, 1)} %`],
            ["Amorteringskrav", `${amortPct} % per år`],
            ["Ränta per månad", kr(interestMonth)],
            ["Ränta efter avdrag (30 %)", kr(interestAfterTax)],
            ["Amortering per månad", kr(amortMonth)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium tabular-nums">{v}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Månadskostnad</dt>
            <dd className="tabular-nums">{kr(interestAfterTax + amortMonth)}</dd>
          </div>
        </dl>
        {tooLittleCash ? <p className="mt-3 text-sm text-neg">Kontantinsatsen räcker inte för detta pris med din inkomst. Minst 10 % kontantinsats krävs.</p> : null}
        <p className="mt-3 text-xs text-muted">Räkneexempel, inte ett lånelöfte. Driftskostnader och avgift till förening ingår inte.</p>
      </div>
    </div>
  );
}
