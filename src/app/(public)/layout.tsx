import Link from "next/link";
import { Logo } from "@/components/logo";
import { PublicHeader } from "@/components/site/public-header";

const FOOTER: [string, [string, string][]][] = [
  ["Vill du ha hjälp?", [["Frågor om pengar", "/info/fragor"], ["Kom igång", "/info/kom-igang"], ["Öppettider", "/info/oppettider"]]],
  ["Spara", [["Konton", "/info/konton"], ["Sparkonto", "/info/sparkonto"], ["Månadsspara", "/info/manadsspara"], ["Bolån", "/info/bolan"]]],
  ["Marknad", [["Marknaden idag", "/marknad"], ["Aktier", "/marknad/aktier"], ["Fonder", "/marknad/fonder"], ["Börshandlade fonder", "/marknad/borshandlade-fonder"]]],
  ["Om Spira", [["Prislista", "/info/prislista"], ["Produktnyheter", "/info/produktnyheter"], ["Spirapodden", "/info/podden"]]],
];

const LEGAL = ["Användarvillkor", "Säkerhet", "Klagomål", "Cookies", "Tillgänglighet", "Personuppgifter"];

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
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
