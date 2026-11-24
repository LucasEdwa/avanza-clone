"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { num } from "@/lib/format";

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-semibold tabular-nums">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-[var(--brand)]" />
    </label>
  );
}

/** Compound-interest savings calculator (monthly contributions, monthly compounding). */
export function SavingsCalculator() {
  const [monthly, setMonthly] = useState(1500);
  const [start, setStart] = useState(25000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(7);

  const { total, deposited, series } = useMemo(() => {
    const r = rate / 100 / 12;
    const series: { year: number; value: number; deposited: number }[] = [];
    let v = start;
    for (let m = 1; m <= years * 12; m++) {
      v = v * (1 + r) + monthly;
      if (m % 12 === 0) series.push({ year: m / 12, value: v, deposited: start + monthly * m });
    }
    return { total: v, deposited: start + monthly * years * 12, series };
  }, [monthly, start, years, rate]);

  const max = Math.max(...series.map((s) => s.value), 1);
  const kr = (v: number) => `${num(v, 0)} kr`;

  return (
    <div className="card mx-auto max-w-md p-6 text-left shadow-xl">
      <div className="text-center">
        <div className="text-4xl font-bold tabular-nums">{kr(Math.round(total / 1000) * 1000)}</div>
        <div className="mt-1 text-sm text-muted">
          efter {years} år, varav {kr(deposited)} insatt
        </div>
      </div>
      <div className="mt-4 flex h-20 items-end gap-[2px]" aria-hidden>
        {series.map((s) => (
          <div key={s.year} className="relative flex-1 rounded-t bg-brand/25" style={{ height: `${(s.value / max) * 100}%` }}>
            <div className="absolute inset-x-0 bottom-0 rounded-t bg-brand" style={{ height: `${(s.deposited / s.value) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-brand" />
          Insatt
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-brand/25" />
          Avkastning
        </span>
      </div>
      <div className="mt-5 space-y-4">
        <Slider label="Månadssparande" value={monthly} min={0} max={20000} step={100} onChange={setMonthly} format={kr} />
        <Slider label="Startbelopp" value={start} min={0} max={1000000} step={5000} onChange={setStart} format={kr} />
        <Slider label="Spartid" value={years} min={1} max={50} step={1} onChange={setYears} format={(v) => `${v} år`} />
        <Slider label="Förväntad årlig avkastning" value={rate} min={0} max={12} step={0.5} onChange={setRate} format={(v) => `${num(v, 1)} %`} />
      </div>
      <p className="mt-4 text-[11px] text-muted">
        Räkneexemplet tar inte hänsyn till skatt, avgifter eller inflation. Historisk avkastning är ingen garanti för framtida avkastning.
      </p>
      <Link href="/logga-in?ny=1" className="btn-primary mt-5 w-full bg-[#11142a] text-white">
        Starta månadssparande
      </Link>
    </div>
  );
}
