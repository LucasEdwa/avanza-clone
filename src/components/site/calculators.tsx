"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";

const kr = (v: number) => `${num(Math.round(v), 0)} kr`;

function Slider({ label, value, min, max, step, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; fmt: (n: number) => string }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-semibold tabular-nums">{fmt(value)}</span>
      </span>
      <input type="range" className="mt-1 w-full accent-[var(--brand)]" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

/** Securities credit: what leverage does to a portfolio, with tiered interest rates. */
export function CreditCalculator() {
  const [own, setOwn] = useState(200000);
  const [loanPct, setLoanPct] = useState(30);
  const [ret, setRet] = useState(8);
  const loan = (own * loanPct) / 100;
  const rate = own + loan >= 1_000_000 ? 4.2 : own + loan >= 300_000 ? 5.2 : 6.2;
  const gross = ((own + loan) * ret) / 100;
  const interest = (loan * rate) / 100;
  const net = gross - interest;
  const withoutLoan = (own * ret) / 100;
  return (
    <div className="space-y-5">
      <div className="card grid gap-6 p-6 md:grid-cols-2">
        <div className="space-y-4">
          <Slider label="Eget kapital" value={own} min={20000} max={2000000} step={10000} onChange={setOwn} fmt={kr} />
          <Slider label="Lån i % av eget kapital" value={loanPct} min={0} max={70} step={5} onChange={setLoanPct} fmt={(v) => `${v} %`} />
          <Slider label="Antagen avkastning per år" value={ret} min={-30} max={30} step={1} onChange={setRet} fmt={(v) => `${v} %`} />
        </div>
        <div className="rounded-2xl bg-mint p-5 text-sm">
          <dl className="space-y-2">
            {[
              ["Belopp att investera", kr(own + loan)],
              ["Lån", kr(loan)],
              ["Ränta (rabattnivå)", `${num(rate, 2)} %`],
              ["Räntekostnad per år", kr(interest)],
              ["Resultat utan lån", kr(withoutLoan)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium tabular-nums">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>Resultat med lån</dt>
              <dd className={cn("tabular-nums", net >= 0 ? "text-pos" : "text-neg")}>{kr(net)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">Med belåning blir både vinster och förluster större. Räkneexempel, före skatt.</p>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Rabattnivå (totalt kapital)</th>
              <th className="num">Ränta</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Under 300 000 kr", 6.2],
              ["300 000 – 1 000 000 kr", 5.2],
              ["Över 1 000 000 kr", 4.2],
            ].map(([l, r]) => (
              <tr key={l as string}>
                <td>{l}</td>
                <td className="num font-semibold">{num(r as number, 2)} %</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-4 py-3 text-xs text-muted">Exempelräntor i demotjänsten.</p>
      </div>
    </div>
  );
}

const LEVELS = [
  { n: 1, name: "Försiktig", stocks: 20, bonds: 80 },
  { n: 2, name: "Låg", stocks: 40, bonds: 60 },
  { n: 3, name: "Balanserad", stocks: 60, bonds: 40 },
  { n: 4, name: "Offensiv", stocks: 80, bonds: 20 },
  { n: 5, name: "Mycket offensiv", stocks: 100, bonds: 0 },
];

export function AutopilotLevels() {
  const [sel, setSel] = useState(3);
  const l = LEVELS[sel - 1];
  return (
    <div className="card p-6">
      <h3 className="font-semibold">Hitta rätt nivå för ditt sparande</h3>
      <p className="mt-1 text-sm text-muted">Ju längre tid du har kvar till att använda pengarna, desto högre andel aktier kan passa.</p>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {LEVELS.map((x) => (
          <button key={x.n} onClick={() => setSel(x.n)} className={cn("rounded-xl border p-3 text-center", sel === x.n ? "border-brand bg-brand-soft" : "border-border hover:bg-surface-2")}>
            <div className="text-lg font-bold">{x.n}</div>
            <div className="text-[11px] text-muted">{x.name}</div>
          </button>
        ))}
      </div>
      <div className="mt-5">
        <div className="flex h-4 overflow-hidden rounded-full">
          <div className="bg-brand" style={{ width: `${l.stocks}%` }} />
          <div className="bg-pos/50" style={{ width: `${l.bonds}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span>
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
            Aktier {l.stocks} %
          </span>
          <span>
            Räntor {l.bonds} % <span className="ml-1 inline-block h-2.5 w-2.5 rounded-sm bg-pos/50" />
          </span>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-mint p-3">
          <dt className="text-xs text-muted">Avgift per år</dt>
          <dd className="font-semibold">0,15 %</dd>
        </div>
        <div className="rounded-xl bg-mint p-3">
          <dt className="text-xs text-muted">Ombalansering</dt>
          <dd className="font-semibold">Varje kvartal</dd>
        </div>
        <div className="rounded-xl bg-mint p-3">
          <dt className="text-xs text-muted">Passar tidshorisont</dt>
          <dd className="font-semibold">{["1–3 år", "3–5 år", "5–10 år", "10+ år", "15+ år"][sel - 1]}</dd>
        </div>
      </dl>
      <Link href="/logga-in?ny=1" className="btn-primary mt-5">
        Kom igång med nivå {sel}
      </Link>
    </div>
  );
}

export function PensionCalculator() {
  const [age, setAge] = useState(35);
  const [retire, setRetire] = useState(65);
  const [monthly, setMonthly] = useState(1500);
  const [now, setNow] = useState(50000);
  const years = Math.max(1, retire - age);
  const total = useMemo(() => {
    let v = now;
    for (let y = 0; y < years; y++) {
      const left = years - y;
      const r = left > 10 ? 0.07 : left > 5 ? 0.05 : 0.03; // gradually more careful
      for (let m = 0; m < 12; m++) v = v * (1 + r / 12) + monthly;
    }
    return v;
  }, [now, years, monthly]);
  return (
    <div className="card grid gap-6 p-6 md:grid-cols-2">
      <div className="space-y-4">
        <Slider label="Din ålder" value={age} min={18} max={64} step={1} onChange={setAge} fmt={(v) => `${v} år`} />
        <Slider label="Pension vid" value={retire} min={Math.max(55, age + 1)} max={70} step={1} onChange={setRetire} fmt={(v) => `${v} år`} />
        <Slider label="Månadssparande" value={monthly} min={0} max={10000} step={100} onChange={setMonthly} fmt={kr} />
        <Slider label="Redan sparat" value={now} min={0} max={2000000} step={10000} onChange={setNow} fmt={kr} />
      </div>
      <div className="flex flex-col justify-center rounded-2xl bg-mint p-6 text-center">
        <div className="text-sm text-muted">Ditt pensionskapital vid {retire} år</div>
        <div className="text-4xl font-bold tabular-nums">{kr(Math.round(total / 1000) * 1000)}</div>
        <div className="mt-2 text-sm text-muted">ca {kr(total / (20 * 12))} per månad i 20 år</div>
        <p className="mt-4 text-xs text-muted">Antagen avkastning 7 % per år som sänks till 3 % de sista fem åren. Före skatt och avgifter.</p>
      </div>
    </div>
  );
}

export function LoanCompare() {
  const [loan, setLoan] = useState(2500000);
  const [cur, setCur] = useState(3.6);
  const ours = 2.89;
  const yearly = (loan * (cur - ours)) / 100;
  return (
    <div className="card grid gap-6 p-6 md:grid-cols-2">
      <div className="space-y-4">
        <Slider label="Ditt bolån" value={loan} min={200000} max={10000000} step={50000} onChange={setLoan} fmt={kr} />
        <Slider label="Din nuvarande ränta" value={cur} min={2} max={6} step={0.05} onChange={setCur} fmt={(v) => `${num(v, 2)} %`} />
      </div>
      <div className="flex flex-col justify-center rounded-2xl bg-mint p-6 text-center">
        <div className="text-sm text-muted">Du kan spara per år</div>
        <div className={cn("text-4xl font-bold tabular-nums", yearly > 0 ? "text-pos" : "")}>{kr(Math.max(0, yearly))}</div>
        <div className="mt-2 text-sm text-muted">
          med vår exempelränta {num(ours, 2)} % (3 mån) · {kr(Math.max(0, yearly * 0.7))} efter ränteavdrag
        </div>
      </div>
    </div>
  );
}

const FAQ: { cat: string; q: string; a: string }[] = [
  { cat: "Konto", q: "Hur öppnar jag ett konto?", a: "Logga in med BankID och välj Öppna konto under Min ekonomi. Kontot är klart direkt efter att du skrivit under." },
  { cat: "Konto", q: "Hur byter jag courtageklass?", a: "Gå till Profil → Courtageklass. Den nya klassen gäller från nästa affär." },
  { cat: "Insättning & uttag", q: "Hur lång tid tar ett uttag?", a: "Uttag till ditt kopplade bankkonto tar normalt 1–2 bankdagar." },
  { cat: "Insättning & uttag", q: "Varför kan jag inte ta ut hela saldot?", a: "Pengar som är reserverade för aktiva köpordrar kan inte tas ut förrän ordern är utförd eller makulerad." },
  { cat: "Handel", q: "Varför har min order inte gått igenom?", a: "En limitorder utförs bara när någon vill handla till ditt pris. Ordern ligger kvar till och med giltighetsdagen." },
  { cat: "Handel", q: "När handlas fonder?", a: "Fondordrar lagda före 15:00 en bankdag handlas till den dagens kurs, senare ordrar nästa bankdag." },
  { cat: "Skatt", q: "Hur beskattas mitt ISK?", a: "Med schablonskatt baserad på kontots värde och insättningar. Se Skatt under Min ekonomi för en uppskattning." },
  { cat: "Skatt", q: "Var hittar jag underlag för K4?", a: "Under Min ekonomi → Skatt visas realiserade vinster och förluster för aktie- & fondkonto." },
  { cat: "Säkerhet", q: "Varför blev jag utloggad?", a: "Av säkerhetsskäl loggas du ut efter 30 minuters inaktivitet." },
  { cat: "Säkerhet", q: "Hur loggar jag ut alla enheter?", a: "Gå till Profil → Säkerhet och välj Logga ut överallt." },
];

export function FaqSearch() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const cats = [...new Set(FAQ.map((f) => f.cat))];
  const list = FAQ.filter((f) => (!cat || f.cat === cat) && (!q || (f.q + f.a).toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-5">
      <label className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 focus-within:border-brand">
        <Search className="h-5 w-5 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök bland frågor och svar" className="w-full bg-transparent outline-none" />
      </label>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCat(null)} className={cn("chip", !cat && "chip-active")}>
          Alla
        </button>
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("chip", cat === c && "chip-active")}>
            {c}
          </button>
        ))}
      </div>
      <div className="card divide-y divide-border">
        {list.length === 0 ? <p className="p-5 text-sm text-muted">Inga träffar.</p> : null}
        {list.map((f) => (
          <details key={f.q} className="group px-5 py-4">
            <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
            <p className="mt-2 text-sm text-muted">{f.a}</p>
          </details>
        ))}
      </div>
      <div className="card p-5 text-sm">
        <div className="font-semibold">Vill du kontakta oss?</div>
        <p className="mt-1 text-muted">Kundservice har öppet vardagar 08:00–18:00. Logga in för att skicka ett säkert meddelande.</p>
      </div>
    </div>
  );
}
