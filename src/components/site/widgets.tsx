import { Check } from "lucide-react";
import type { Widget } from "@/lib/site-nav";
import { getNews } from "@/lib/market/data";
import { isMarketOpen, upcomingHolidays } from "@/lib/market-hours";
import { COURTAGE_CLASSES, FX_FEE_PCT, type CourtageClass } from "@/lib/courtage";
import { dateSv, num, relativeSv } from "@/lib/format";
import { Card } from "@/components/ui";
import { SavingsCalculator } from "@/components/landing/savings-calculator";
import { StepIcon } from "@/components/landing/illustrations";
import { LoanCalculator } from "./loan-calculator";
import { AutopilotLevels, CreditCalculator, FaqSearch, LoanCompare, PensionCalculator } from "./calculators";
import { GlidePath, MortgageAffordability, PortfolioFee, RateFinder } from "./calculators2";

export async function WidgetView({ widget }: { widget: Widget }) {
  switch (widget) {
    case "savings-calculator":
      return <SavingsCalculator />;
    case "loan-calculator":
      return <LoanCalculator />;
    case "rates":
      return <Rates />;
    case "pricelist":
      return <PriceList />;
    case "accounts":
      return <Accounts />;
    case "steps":
      return <Steps />;
    case "news":
      return <News queries={["Sweden economy", "Riksbank", "stock market"]} />;
    case "market-news":
      return <News queries={["OMX Stockholm 30", "Swedish stocks", "stock market"]} />;
    case "trading-calendar":
      return <TradingCalendar />;
    case "credit-calculator":
      return <CreditCalculator />;
    case "autopilot-levels":
      return <AutopilotLevels />;
    case "pension-calculator":
      return <PensionCalculator />;
    case "loan-compare":
      return <LoanCompare />;
    case "faq-search":
      return <FaqSearch />;
    case "mortgage-affordability":
      return <MortgageAffordability />;
    case "rate-finder":
      return <RateFinder />;
    case "portfolio-fee":
      return <PortfolioFee />;
    case "glide-path":
      return <GlidePath />;
  }
}

function Rates() {
  const terms = ["3 mån", "1 år", "2 år", "3 år", "4 år", "5 år", "10 år"];
  const base = [2.89, 2.79, 2.84, 2.95, 3.05, 3.15, 3.49];
  const bands: [string, number][] = [["Belåning under 60 %", -0.15], ["60–75 %", 0], ["75–85 %", 0.2]];
  return (
    <Card className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Bolån</th>
            {terms.map((t) => (
              <th key={t} className="num">
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bands.map(([l, d]) => (
            <tr key={l}>
              <td className="font-medium">{l}</td>
              {base.map((r, i) => (
                <td key={i} className="num">
                  {num(r + d, 2)} %
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-3 text-xs text-muted">Exempelräntor i demotjänsten. Ränterabatt med 0,10 procentenheter om du har minst 1 miljon kr i sparkapital hos Spira.</p>
    </Card>
  );
}

function PriceList() {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Courtageklass</th>
              <th className="num">Avgift</th>
              <th className="num">Lägst</th>
              <th>Passar för</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(COURTAGE_CLASSES) as CourtageClass[]).map((k) => {
              const c = COURTAGE_CLASSES[k];
              return (
                <tr key={k}>
                  <td className="font-medium">{c.label}</td>
                  <td className="num">{c.fixed ? `${c.fixed} kr` : `${num(c.pct * 100, 3, 3).replace(/0+$/, "").replace(/,$/, "")} %`}</td>
                  <td className="num">{c.fixed ? "–" : `${c.min} kr`}</td>
                  <td className="!whitespace-normal text-muted">{c.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Fonder", "0 kr courtage"],
          ["Valutaväxling", `${num(FX_FEE_PCT * 100, 2)} %`],
          ["Depåavgift", "0 kr"],
          ["Insättning & uttag", "0 kr"],
          ["Flytt av värdepapper hit", "0 kr"],
          ["Månadssparande", "0 kr"],
        ].map(([k, v]) => (
          <div key={k} className="card p-4">
            <div className="text-xs text-muted">{k}</div>
            <div className="text-lg font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Accounts() {
  const rows: [string, string, string, string, string][] = [
    ["Skatt", "Schablonskatt", "Avkastningsskatt (schablon)", "30 % på vinst och utdelning", "30 % på ränta"],
    ["Deklarera affärer", "Nej", "Nej", "Ja (K4)", "Nej"],
    ["Avdrag för förluster", "Nej", "Nej", "Ja", "–"],
    ["Förmånstagare", "Nej", "Ja", "Nej", "Nej"],
    ["Aktier, fonder, ETF:er", "Ja", "Ja", "Ja", "Nej"],
    ["Passar för", "Långsiktigt sparande", "Sparande med förmånstagare", "Belåning, kortsiktig handel", "Buffert"],
  ];
  return (
    <Card className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th />
            <th>ISK</th>
            <th>KF</th>
            <th>AF</th>
            <th>Sparkonto</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, ...v]) => (
            <tr key={k}>
              <td className="font-medium">{k}</td>
              {v.map((x, i) => (
                <td key={i} className="!whitespace-normal">
                  {x}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function Steps() {
  const steps = [
    ["account", "1. Bli kund", "Identifiera dig med BankID, svara på kundkännedomsfrågorna och välj konto. Det tar ungefär tre minuter."],
    ["deposit", "2. Sätt in pengar", "Koppla ditt bankkonto och gör en direktinsättning. Pengarna syns på kontot direkt."],
    ["invest", "3. Investera", "Köp din första fond eller aktie, eller starta ett månadssparande från 100 kr."],
  ] as const;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {steps.map(([k, t, d]) => (
        <div key={k} className="card flex flex-col items-center p-6 text-center">
          <StepIcon kind={k} />
          <div className="mt-3 font-semibold">{t}</div>
          <p className="mt-1 text-sm text-muted">{d}</p>
        </div>
      ))}
    </div>
  );
}

async function News({ queries }: { queries: string[] }) {
  let items: Awaited<ReturnType<typeof getNews>> = [];
  for (const q of queries) {
    items = await getNews(q);
    if (items.length) break;
  }
  return (
    <Card>
      <ul className="divide-y divide-border px-5">
        {items.length === 0 ? <li className="py-6 text-sm text-muted">Inga nyheter just nu.</li> : null}
        {items.map((n) => (
          <li key={n.id}>
            <a href={n.link} target="_blank" rel="noreferrer noopener" className="flex gap-4 py-4 hover:text-brand">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{n.title}</span>
                <span className="text-xs text-muted">
                  {n.publisher} · {relativeSv(n.time)}
                </span>
              </span>
              {n.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.thumb} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" loading="lazy" />
              ) : null}
            </a>
          </li>
        ))}
      </ul>
      <p className="px-5 pb-4 text-xs text-muted">Nyheter från Yahoo Finance och dess partner, på engelska.</p>
    </Card>
  );
}





function TradingCalendar() {
  const markets = [
    ["Stockholmsbörsen", "09:00–17:30", isMarketOpen("STO")],
    ["Köpenhamn", "09:00–17:00", isMarketOpen("CPH")],
    ["Oslo", "09:00–16:20", isMarketOpen("OSL")],
    ["Xetra (Tyskland)", "09:00–17:30", isMarketOpen("EU")],
    ["NYSE & Nasdaq (USA)", "15:30–22:00 svensk tid", isMarketOpen("US")],
    ["Fonder", "Order före 15:00 handlas samma dag", false],
  ] as const;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Öppettider">
        <ul className="divide-y divide-border px-5 pb-2 text-sm">
          {markets.map(([m, h, open]) => (
            <li key={m} className="flex items-center justify-between py-3">
              <span>
                <span className="font-medium">{m}</span>
                <span className="block text-xs text-muted">{h}</span>
              </span>
              {m !== "Fonder" ? <span className={open ? "badge bg-pos-soft text-pos" : "badge bg-surface-2 text-muted"}>{open ? "Öppen nu" : "Stängd"}</span> : null}
            </li>
          ))}
        </ul>
      </Card>
      <div className="space-y-5">
        {(["STO", "US"] as const).map((v) => (
          <Card key={v} title={v === "STO" ? "🇸🇪 Sverige – avvikande öppettider" : "🇺🇸 USA – avvikande öppettider"}>
            <table className="table mt-2">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Avvikelse</th>
                </tr>
              </thead>
              <tbody>
                {upcomingHolidays(v, undefined, 8).map((h) => (
                  <tr key={h.date}>
                    <td className="tabular-nums">{dateSv(h.date)}</td>
                    <td>
                      Stängt{v === "STO" ? <span className="text-muted"> · {h.name}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted lg:col-span-2">
        Dag före helgdag kan börsen stänga tidigare (halvdag). Utdelning: aktien handlas utan rätt till utdelning från X-dagen. Likviddag är två bankdagar efter affärsdagen. Tidszon: svensk tid (CET/CEST).
      </p>
    </div>
  );
}

export function Points({ points }: { points: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {points.map((p) => (
        <li key={p} className="flex gap-2 rounded-xl bg-mint p-3 text-sm">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-pos" /> {p}
        </li>
      ))}
    </ul>
  );
}
