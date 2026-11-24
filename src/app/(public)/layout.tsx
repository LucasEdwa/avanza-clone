import Link from "next/link";
import { Logo } from "@/components/logo";
import { getUser } from "@/lib/auth";
import { TickerBar } from "@/components/landing/ticker-bar";

const NAV = [
  ["Spara & investera", "/marknad/fonder"],
  ["Börsen", "/marknad"],
  ["Aktier", "/marknad/aktier"],
  ["ETF:er", "/marknad/borshandlade-fonder"],
  ["Kundservice", "/logga-in"],
];

const FOOTER: [string, [string, string][]][] = [
  ["Vill du ha hjälp?", [["Frågor & svar", "/logga-in"], ["Kontakta oss", "/logga-in"]]],
  ["Spara", [["Investeringssparkonto", "/logga-in?ny=1"], ["Kapitalförsäkring", "/logga-in?ny=1"], ["Sparkonto", "/logga-in?ny=1"], ["Månadsspara", "/logga-in?ny=1"]]],
  ["Marknad", [["Marknaden idag", "/marknad"], ["Aktier", "/marknad/aktier"], ["Fonder", "/marknad/fonder"], ["Börshandlade fonder", "/marknad/borshandlade-fonder"]]],
  ["Om Spira", [["Prislista", "/logga-in?ny=1"], ["Säkerhet & BankID", "/logga-in"], ["Karriär", "/"]]],
];

const LEGAL = ["Användarvillkor", "Säkerhet", "Klagomål", "Cookies", "Tillgänglighet", "Personuppgifter"];

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();
  return (
    <div className="flex min-h-screen flex-col">
      <TickerBar />
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map(([l, h]) => (
              <Link key={l} href={h} className="rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:text-fg">
                {l}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <Link href="/min-ekonomi/oversikt" className="btn-primary">
                Min ekonomi
              </Link>
            ) : (
              <>
                <Link href="/logga-in" className="btn-secondary">
                  Logga in
                </Link>
                <Link href="/logga-in?ny=1" className="btn-primary hidden sm:inline-flex">
                  Bli kund
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-5">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted">Sparande och aktiehandel för alla. Logga in och skriv under med BankID.</p>
          </div>
          {FOOTER.map(([h, links]) => (
            <div key={h}>
              <div className="mb-3 text-sm font-semibold">{h}</div>
              <ul className="space-y-2 text-sm text-muted">
                {links.map(([l, href]) => (
                  <li key={l}>
                    <Link href={href} className="hover:text-fg">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-2 border-t border-border px-4 py-5 text-xs text-muted">
          {LEGAL.map((l) => (
            <span key={l} className="cursor-default">
              {l}
            </span>
          ))}
        </div>
        <div className="border-t border-border py-6 text-center text-xs text-muted">
          <p>Spira är en demonstrationstjänst. Ingen riktig handel sker och inga riktiga pengar hanteras.</p>
          <p className="mt-1">Marknadsdata från Yahoo Finance, kan vara fördröjd. Historisk avkastning är ingen garanti för framtida avkastning.</p>
        </div>
      </footer>
    </div>
  );
}
