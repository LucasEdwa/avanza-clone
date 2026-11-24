import Link from "next/link";
import { ArrowRight, ChevronRight, Headphones, MonitorSmartphone, Smartphone } from "lucide-react";
import { CardThumb, GoalIcon, HeroArt, MoveArt, PhoneMock, StepIcon, TrustBadge } from "@/components/landing/illustrations";
import { SavingsCalculator } from "@/components/landing/savings-calculator";

const NEWS = [
  {
    thumb: "move" as const,
    title: "Flytta ditt sparande hit",
    text: "Samla aktier och fonder från andra banker på ett ställe. Vi sköter flytten åt dig, utan kostnad.",
    cta: "Flytta dina värdepapper",
    href: "/logga-in?ny=1",
  },
  {
    thumb: "fund" as const,
    title: "Indexfonder från 0,1 % i avgift",
    text: "Jämför avgift, risk och avkastning för hundratals fonder. Köp från 100 kr, helt utan courtage.",
    cta: "Hitta din fond",
    href: "/marknad/fonder",
  },
  {
    thumb: "pension" as const,
    title: "Ränta på sparkontot",
    text: "Låt bufferten arbeta. Sparkontot har rörlig ränta som betalas ut varje månad och fria uttag.",
    cta: "Öppna sparkonto",
    href: "/logga-in?ny=1",
  },
];

const STEPS = [
  { kind: "account" as const, title: "Bli kund", text: "Identifiera dig med BankID och svara på några frågor. Klart på tre minuter." },
  { kind: "deposit" as const, title: "Sätt in pengar", text: "Koppla ditt bankkonto och gör en direktinsättning. Pengarna syns på kontot direkt." },
  { kind: "invest" as const, title: "Börja investera", text: "Köp aktier, fonder och ETF:er eller sätt upp ett månadssparande från 100 kr." },
];

const GOALS = [
  { kind: "home" as const, title: "Spara till bostaden", text: "Bygg upp kontantinsatsen med ett sparkonto eller en räntefond med låg risk.", href: "/logga-in?ny=1" },
  { kind: "kids" as const, title: "Spara till barnen", text: "Ett litet månadsbelopp kan bli en ordentlig startpott när barnen flyttar hemifrån.", href: "/logga-in?ny=1" },
  { kind: "pension" as const, title: "Spara till pensionen", text: "Komplettera den allmänna pensionen med eget sparande, ju tidigare desto bättre.", href: "/logga-in?ny=1" },
];

const LEARN = [
  { title: "ISK, KF eller AF – vilket konto passar dig?", text: "Så skiljer sig kontotyperna åt när det gäller skatt, förmånstagare och förluster.", href: "/logga-in?ny=1", tag: "Guide · 6 min" },
  { title: "Fondsparande för nybörjare", text: "Vad är en indexfond, vad betyder risknivå 1–7 och hur mycket ska avgiften få kosta?", href: "/marknad/fonder", tag: "Guide · 8 min" },
];

export default function Home() {
  return (
    <div className="overflow-hidden bg-surface">
      {/* Hero */}
      <section className="bg-gradient-to-b from-mint-strong/70 via-mint to-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
              Sparandet som växer
              <br />i din takt.
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted">
              Aktier, fonder och ETF:er till låga avgifter. Öppna ett investeringssparkonto med BankID och kom igång på några minuter.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/logga-in?ny=1" className="btn bg-[#11142a] px-7 py-3 text-base text-white hover:brightness-125 dark:bg-white dark:text-[#11142a]">
                Bli kund på 3 min
              </Link>
              <Link href="/logga-in" className="text-sm font-semibold text-brand hover:underline">
                Redan kund? Logga in
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted">*0 kr courtage för nya kunder upp till 50 000 kr handlad volym.</p>
          </div>
          <div className="flex justify-center">
            <HeroArt />
          </div>
        </div>
      </section>

      {/* Move savings */}
      <section className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-16 md:grid-cols-2">
        <div className="flex justify-center">
          <MoveArt />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Samla ditt sparande hos oss</h2>
          <p className="mt-3 text-muted">
            Har du aktier och fonder utspridda på flera ställen? Vi hjälper dig att flytta dem hit, kostnadsfritt. Du behåller dina innehav och
            får full överblick på ett ställe.
          </p>
          <Link href="/logga-in?ny=1" className="btn mt-6 bg-[#11142a] px-6 py-2.5 text-white hover:brightness-125 dark:bg-white dark:text-[#11142a]">
            Flytta hit dina värdepapper
          </Link>
        </div>
      </section>

      {/* News cards */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">Aktuellt från Spira</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {NEWS.map((n) => (
            <Link key={n.title} href={n.href} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
              <CardThumb variant={n.thumb} />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold">{n.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{n.text}</p>
                <span className="mt-4 border-t border-border pt-3 text-center text-sm font-semibold text-brand group-hover:underline">{n.cta}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section className="relative bg-mint py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 text-brand/30 select-none">
          {[
            [6, 18, "+"],
            [12, 62, "–"],
            [20, 35, "+"],
            [82, 22, "+"],
            [90, 55, "–"],
            [76, 78, "+"],
            [8, 85, "+"],
            [94, 88, "–"],
            [30, 92, "–"],
            [68, 8, "–"],
          ].map(([x, y, s], i) => (
            <span key={i} className="absolute text-3xl font-light" style={{ left: `${x}%`, top: `${y}%` }}>
              {s}
            </span>
          ))}
        </div>
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Räkna på ditt sparande</h2>
          <p className="mx-auto mt-3 mb-8 max-w-lg text-muted">
            Små belopp blir stora med tiden tack vare ränta-på-ränta. Dra i reglagen och se hur ditt månadssparande kan växa.
          </p>
          <SavingsCalculator />
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Så kommer du igång</h2>
        <p className="mx-auto mt-3 max-w-lg text-muted">Tre steg från idé till investering. Allt sker digitalt med BankID.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card flex flex-col items-center p-6">
              <StepIcon kind={s.kind} />
              <div className="mt-3 text-xs font-semibold text-brand">Steg {i + 1}</div>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>
        <Link href="/logga-in?ny=1" className="btn-primary mt-8 px-6 py-3">
          Bli kund nu <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Mobile */}
      <section className="bg-gradient-to-b from-surface to-mint">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ha koll på sparandet i mobilen</h2>
            <p className="mt-3 text-muted">
              Följ kurserna löpande, få notiser när dina ordrar går igenom och när en kursvarning slår till. Spira fungerar lika bra i mobilen
              som på datorn, och du kan lägga till den på hemskärmen.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {["Logga in med Mobilt BankID", "Köp och sälj på några sekunder", "Notiser om avslut och kursvarningar"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-brand" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg bg-[#11142a] px-3 py-2 text-xs font-semibold text-white">
                <MonitorSmartphone className="h-4 w-4" /> Lägg till på hemskärmen
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-[#11142a] px-3 py-2 text-xs font-semibold text-white">
                <Smartphone className="h-4 w-4" /> Mörkt läge ingår
              </span>
            </div>
          </div>
          <PhoneMock />
        </div>
      </section>

      {/* Learn */}
      <section className="bg-mint">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight sm:text-3xl">Lär dig mer om sparande</h2>
        <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
          {LEARN.map((l, i) => (
            <Link key={l.title} href={l.href} className="card group overflow-hidden transition hover:shadow-lg">
              <div className={`flex h-36 items-center justify-center ${i === 0 ? "bg-gradient-to-br from-brand to-[#0ea5e9]" : "bg-gradient-to-br from-[#0b8a4f] to-[#14b8a6]"}`}>
                <Headphones className="h-12 w-12 text-white/90" />
              </div>
              <div className="p-5">
                <div className="text-xs font-semibold text-brand">{l.tag}</div>
                <h3 className="mt-1 font-semibold">{l.title}</h3>
                <p className="mt-2 text-sm text-muted">{l.text}</p>
                <span className="mt-3 inline-flex items-center text-sm font-semibold text-brand group-hover:underline">
                  Läs mer <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      </section>

      {/* Next steps */}
      <section className="bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Redo för nästa steg?</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">Oavsett om målet ligger två eller trettio år bort kan du börja spara mot det redan idag.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {GOALS.map((g) => (
              <Link key={g.title} href={g.href} className="card flex flex-col items-center p-7 transition hover:-translate-y-0.5 hover:shadow-lg">
                <GoalIcon kind={g.kind} />
                <h3 className="mt-4 font-semibold">{g.title}</h3>
                <p className="mt-2 text-sm text-muted">{g.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-gradient-to-b from-surface to-mint">
        <div className="mx-auto grid max-w-4xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div className="flex justify-center">
            <TrustBadge />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Låga avgifter. Säkert med BankID.</h2>
            <p className="mt-3 text-muted">
              Logga in, skriv under uttag och öppna konton med BankID. Som ny kund handlar du för 0 kr i courtage upp till 50 000 kr.
            </p>
            <Link href="/logga-in?ny=1" className="btn mt-6 bg-[#11142a] px-6 py-2.5 text-white hover:brightness-125 dark:bg-white dark:text-[#11142a]">
              Bli kund
            </Link>
          </div>
        </div>
      </section>

      {/* Risk information */}
      <section className="bg-mint">
        <div className="mx-auto max-w-3xl px-4 py-10 text-xs text-muted">
          <h3 className="mb-2 text-sm font-semibold text-fg">Om att investera i värdepapper</h3>
          <p>
            Att investera i aktier, fonder och andra värdepapper innebär alltid en risk. Värdet på din investering kan både öka och minska,
            och du kan få tillbaka mindre än du satt in. Historisk avkastning är ingen garanti för framtida avkastning. Fundera på din
            tidshorisont, sprid riskerna och investera bara pengar du klarar dig utan på kort sikt. Läs alltid faktabladet innan du köper en
            fond.
          </p>
        </div>
      </section>
    </div>
  );
}
