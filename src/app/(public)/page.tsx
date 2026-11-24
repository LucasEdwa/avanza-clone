import Link from "next/link";
import { ArrowRight, BarChart3, PiggyBank, ShieldCheck, Zap } from "lucide-react";
import { BankIdBadge } from "@/components/bankid/bankid-flow";

export default function Home() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="badge mb-4 bg-brand-soft text-brand">Nytt: månadsspara i fonder från 100 kr</span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Låt ditt sparande växa.</h1>
          <p className="mt-4 max-w-md text-lg text-muted">
            Handla aktier, fonder och ETF:er på Stockholmsbörsen och i USA. Öppna ISK på några minuter med BankID.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/logga-in?ny=1" className="btn-primary px-6 py-3 text-base">
              Bli kund <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/logga-in" className="btn-secondary px-6 py-3 text-base">
              Logga in med <BankIdBadge />
            </Link>
          </div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-muted">Courtage från</div>
          <div className="text-5xl font-bold">0 kr</div>
          <div className="mt-1 text-sm text-muted">för dig som är ny, upp till 50 000 kr handlad volym</div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {[
              ["150+", "aktier, fonder och ETF:er"],
              ["0,25 %", "Mini-courtage, lägst 1 kr"],
              ["ISK, KF, AF", "och sparkonto med ränta"],
              ["Realtid", "kurser under börsens öppettider"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-xl bg-surface-2 p-3">
                <div className="font-semibold">{a}</div>
                <div className="text-muted">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [Zap, "Snabb handel", "Lägg köp- och säljordrar, stop loss och följ dina avslut direkt."],
          [PiggyBank, "Månadsspara", "Automatiskt sparande i fonder, dragning via autogiro."],
          [BarChart3, "Full koll", "Utveckling, innehav, GAV, transaktioner och skatteunderlag."],
          [ShieldCheck, "Säker inloggning", "BankID för inloggning och underskrift av uttag och avtal."],
        ].map(([Icon, t, d]) => {
          const I = Icon as typeof Zap;
          return (
            <div key={t as string} className="card p-5">
              <I className="h-6 w-6 text-brand" />
              <div className="mt-3 font-semibold">{t as string}</div>
              <p className="mt-1 text-sm text-muted">{d as string}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
