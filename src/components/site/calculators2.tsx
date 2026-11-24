"use client";

import { useState } from "react";
import Link from "next/link";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";

const kr = (v: number) => `${num(Math.round(v), 0)} kr`;

function Field({ label, value, onChange, suffix = "kr", step = 1000 }: { label: string; value: number; onChange: (n: number) => void; suffix?: string; step?: number }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="flex items-center rounded-xl border border-border bg-surface focus-within:border-brand">
        <input className="w-full bg-transparent px-3 py-2 text-sm outline-none" type="number" min={0} step={step} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
        <span className="pr-3 text-xs text-muted">{suffix}</span>
      </span>
    </label>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card p-5">
      <legend className="mb-3 flex items-center gap-2 font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint-strong text-sm text-pos">{n}</span>
        {title}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/**
 * "Hur mycket får jag låna?" – four sections like a bank's affordability check:
 * borrowers, home & down payment, household costs, other loans. Uses a left-to-live-on (KALP)
 * calculation at a 7 % stress rate, the 5.5× income cap and the 85 % loan-to-value limit.
 */
export function MortgageAffordability() {
  const [adults, setAdults] = useState(2);
  const [income, setIncome] = useState(70000);
  const [birth, setBirth] = useState(1990);
  const [kind, setKind] = useState<"br" | "villa">("br");
  const [price, setPrice] = useState(4000000);
  const [cash, setCash] = useState(600000);
  const [fee, setFee] = useState(4500);
  const [kids, setKids] = useState(1);
  const [cars, setCars] = useState(1);
  const [other, setOther] = useState(3000);
  const [loans, setLoans] = useState(0);
  const [csn, setCsn] = useState(0);
  const [cards, setCards] = useState(0);

  const annual = income * 12;
  const netMonthly = income * 0.7; // rough after-tax
  const living = adults * 10500 + kids * 4000 + cars * 3500 + other + fee + (kind === "villa" ? 4500 : 0);
  const otherDebt = loans + csn + cards;
  const otherDebtCost = otherDebt * 0.01;
  const stress = 0.07;
  // monthly room for housing loan cost at stress rate after living costs
  const room = Math.max(0, netMonthly - living - otherDebtCost);
  const byKalp = (room * 12) / (stress * 0.7 + 0.02);
  const byIncome = Math.max(0, annual * 5.5 - otherDebt);
  const byLtv = price * 0.85;
  const max = Math.max(0, Math.min(byKalp, byIncome, byLtv, price - cash));
  const ltv = price ? max / price : 0;
  let amort = ltv > 0.7 ? 2 : ltv > 0.5 ? 1 : 0;
  if (max + otherDebt > annual * 4.5) amort += 1;
  const limiting = max === byKalp ? "din betalningsförmåga" : max === byIncome ? "skuldkvoten (5,5 × årsinkomst)" : max === byLtv ? "belåningstaket (85 %)" : "din kontantinsats";
  const age = new Date().getFullYear() - birth;


  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <Section n={1} title="Låntagare">
          <label className="block">
            <span className="label">Antal låntagare</span>
            <select className="input" value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </label>
          <Field label="Inkomst före skatt, totalt" value={income} onChange={setIncome} suffix="kr/mån" />
          <Field label="Födelseår (äldsta låntagaren)" value={birth} onChange={setBirth} suffix="ÅÅÅÅ" step={1} />
        </Section>
        <Section n={2} title="Bostad och kontantinsats">
          <label className="block">
            <span className="label">Typ av bostad</span>
            <select className="input" value={kind} onChange={(e) => setKind(e.target.value as "br" | "villa")}>
              <option value="br">Bostadsrätt</option>
              <option value="villa">Villa / radhus</option>
            </select>
          </label>
          <Field label="Pris" value={price} onChange={setPrice} step={50000} />
          <Field label="Kontantinsats" value={cash} onChange={setCash} step={10000} />
          <Field label={kind === "br" ? "Månadsavgift" : "Driftkostnad"} value={fee} onChange={setFee} suffix="kr/mån" step={100} />
        </Section>
        <Section n={3} title="Hushåll och utgifter">
          <Field label="Antal barn" value={kids} onChange={setKids} suffix="st" step={1} />
          <Field label="Antal bilar" value={cars} onChange={setCars} suffix="st" step={1} />
          <Field label="Övriga fasta utgifter" value={other} onChange={setOther} suffix="kr/mån" step={500} />
        </Section>
        <Section n={4} title="Lån och krediter">
          <Field label="Andra lån (bil, privatlån)" value={loans} onChange={setLoans} step={10000} />
          <Field label="Studielån (CSN)" value={csn} onChange={setCsn} step={10000} />
          <Field label="Kreditkort / kontokredit" value={cards} onChange={setCards} step={5000} />
        </Section>
      </div>
      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <div className="text-sm text-muted">Du kan låna ungefär</div>
        <div className="text-4xl font-bold tabular-nums">{kr(Math.floor(max / 10000) * 10000)}</div>
        <p className="mt-1 text-xs text-muted">Begränsas av {limiting}.</p>
        <dl className="mt-5 space-y-2 text-sm">
          {[
            ["Belåningsgrad", `${num(ltv * 100, 1)} %`],
            ["Amorteringskrav", `${amort} % per år`],
            ["Ränta 3 mån (exempel)", "2,89 %"],
            ["Räntekostnad efter avdrag", `${kr((max * 0.0289 * 0.7) / 12)}/mån`],
            ["Amortering", `${kr((max * amort) / 100 / 12)}/mån`],
            ["Kvar att leva på", `${kr(room - (max * (0.0289 * 0.7 + amort / 100)) / 12)}/mån`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        {age > 70 ? <p className="mt-3 text-xs text-warn">Över 70 år görs en individuell bedömning.</p> : null}
        <Link href="/logga-in?ny=1" className="btn mt-5 w-full bg-[#11142a] py-2.5 text-white dark:bg-white dark:text-[#11142a]">
          Ansök om lånelöfte
        </Link>
        <p className="mt-3 text-[11px] text-muted">Förenklad kalkyl med stressränta 7 % och schablonkostnader. Inte ett lånelöfte.</p>
      </aside>
    </div>
  );
}

/** "Se din bästa ränta": value + loan → rate per binding period. */
export function RateFinder() {
  const [value, setValue] = useState(4000000);
  const [loan, setLoan] = useState(2500000);
  const ltv = value ? loan / value : 0;
  const adj = ltv <= 0.6 ? -0.15 : ltv <= 0.75 ? 0 : 0.2;
  const terms: [string, number][] = [["3 mån", 2.89], ["1 år", 2.79], ["2 år", 2.84], ["3 år", 2.95], ["4 år", 3.05], ["5 år", 3.15], ["10 år", 3.49]];
  return (
    <div className="card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bostadens värde" value={value} onChange={setValue} step={50000} />
        <Field label="Lånebelopp" value={loan} onChange={setLoan} step={50000} />
      </div>
      <p className={cn("mt-3 text-sm", ltv > 0.85 ? "text-neg" : "text-muted")}>
        Belåningsgrad {num(ltv * 100, 1)} %{ltv > 0.85 ? " – över belåningstaket 85 %." : ""}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {terms.map(([t, r]) => (
          <div key={t} className="rounded-xl bg-mint p-3 text-center">
            <div className="text-xs text-muted">{t}</div>
            <div className="text-lg font-bold tabular-nums">{num(r + adj, 2)} %</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Exempelräntor i demotjänsten. Effektiv ränta kan avvika något.</p>
    </div>
  );
}

const PROFILES = {
  mix: { label: "Mix", text: "Aktier i Sverige och världen blandat med räntor.", stocks: 70 },
  stabil: { label: "Stabil", text: "Tyngdpunkt på räntor för lägre svängningar.", stocks: 30 },
};

/** Discretionary portfolio management: choose profile, capital → yearly fee. */
export function PortfolioFee() {
  const [p, setP] = useState<keyof typeof PROFILES>("mix");
  const [cap, setCap] = useState(1000000);
  const pct = cap >= 5_000_000 ? 0.3 : cap >= 2_000_000 ? 0.4 : 0.5;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="card p-6">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PROFILES) as (keyof typeof PROFILES)[]).map((k) => (
            <button key={k} onClick={() => setP(k)} className={cn("rounded-xl border p-4 text-left", p === k ? "border-brand bg-brand-soft" : "border-border")}>
              <div className="font-semibold">{PROFILES[k].label}</div>
              <div className="mt-1 text-xs text-muted">{PROFILES[k].text}</div>
            </button>
          ))}
        </div>
        <div className="mt-5 flex h-3 overflow-hidden rounded-full">
          <div className="bg-brand" style={{ width: `${PROFILES[p].stocks}%` }} />
          <div className="bg-pos/50" style={{ width: `${100 - PROFILES[p].stocks}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>Aktier {PROFILES[p].stocks} %</span>
          <span>Räntor {100 - PROFILES[p].stocks} %</span>
        </div>
      </div>
      <div className="card p-6">
        <Field label="Kapital att förvalta" value={cap} onChange={setCap} step={100000} />
        <div className="mt-5 rounded-2xl bg-mint p-5 text-center">
          <div className="text-sm text-muted">Årlig avgift</div>
          <div className="text-3xl font-bold">{num(pct, 2)} %</div>
          <div className="text-sm text-muted">≈ {kr((cap * pct) / 100)} per år, inklusive underliggande fonder</div>
        </div>
        <p className="mt-3 text-xs text-muted">Lägsta kapital 1 000 000 kr. Avgiftstrappa: 0,50 % / 0,40 % från 2 mn / 0,30 % från 5 mn (exempel).</p>
      </div>
    </div>
  );
}

/** Age-based allocation for automatic pension saving. */
export function GlidePath() {
  const points = [25, 35, 45, 55, 60, 65, 70].map((age) => ({ age, stocks: age <= 45 ? 100 : Math.max(30, 100 - (age - 45) * 3) }));
  return (
    <div className="card p-6">
      <div className="flex h-48 items-end gap-3">
        {points.map((p) => (
          <div key={p.age} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-col overflow-hidden rounded-t-lg" style={{ height: 160 }}>
              <div className="bg-pos/40" style={{ height: `${100 - p.stocks}%` }} />
              <div className="bg-brand" style={{ height: `${p.stocks}%` }} />
            </div>
            <span className="text-xs text-muted">{p.age} år</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs">
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
          Aktiefonder
        </span>
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-pos/40" />
          Räntefonder
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">Fram till 45 år ligger allt i aktiefonder. Därefter flyttas en allt större del till räntefonder för att minska svängningarna inför pensionen.</p>
    </div>
  );
}
