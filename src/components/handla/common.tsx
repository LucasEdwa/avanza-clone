import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const FLAG: Record<string, string> = { SE: "🇸🇪", US: "🇺🇸", DK: "🇩🇰", NO: "🇳🇴", DE: "🇩🇪", FI: "🇫🇮", GB: "🇬🇧", FR: "🇫🇷", JP: "🇯🇵", CN: "🇨🇳", IN: "🇮🇳", CA: "🇨🇦", HK: "🇭🇰", KR: "🇰🇷", IT: "🇮🇹", PT: "🇵🇹", NL: "🇳🇱", BE: "🇧🇪", EU: "🇪🇺" };

export function RiskNotice() {
  return (
    <details open className="card group mb-6 px-5 py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
        Investeringar innebär en risk
        <ChevronRight className="h-4 w-4 -rotate-90 text-muted transition group-open:rotate-[-90deg] [details:not([open])_&]:rotate-90" />
      </summary>
      <p className="mt-2 text-sm text-muted">
        Aktier och fonder har historiskt gett god avkastning på lång sikt, men ingen vet hur det går framöver. Värdet kan både stiga och sjunka, och du kan få tillbaka mindre än du satte in.
      </p>
    </details>
  );
}

export function HandlaTabs({ title, tabs, active }: { title: string; tabs: { key: string; label: string; href: string }[]; active: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <div className="mt-4 flex gap-5 text-sm">
        {tabs.map((t) => (
          <Link key={t.key} href={t.href} className={cn("border-b-2 pb-1.5", t.key === active ? "border-brand font-semibold text-fg" : "border-transparent text-muted hover:text-fg")}>
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export const AKTIE_TABS = [
  { key: "insp", label: "Aktieinspiration", href: "/marknad/aktier" },
  { key: "screener", label: "Aktiescreener", href: "/marknad/aktier/screener" },
  { key: "analyser", label: "Externa analyser", href: "/marknad/aktier/analyser" },
];
export const FOND_TABS = [
  { key: "insp", label: "Inspiration", href: "/marknad/fonder" },
  { key: "kat", label: "Kategorier", href: "/marknad/fonder/kategorier" },
  { key: "lista", label: "Alla fonder", href: "/marknad/fonder/lista" },
];

export function TopList({
  title,
  rows,
  more,
}: {
  title: string;
  rows: { href: string; name: string; sub: ReactNode; label: string; value: ReactNode }[];
  more?: string;
}) {
  return (
    <section className="card flex flex-col overflow-hidden">
      <h3 className="border-b border-border px-4 py-3.5 text-sm font-semibold">{title}</h3>
      <ol className="flex-1 divide-y divide-border">
        {rows.length === 0 ? <li className="px-4 py-6 text-sm text-muted">Inget att visa ännu.</li> : null}
        {rows.map((r, i) => (
          <li key={r.href + i}>
            <Link href={r.href} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint-strong text-xs font-semibold text-pos">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{r.name}</span>
                <span className="text-xs text-muted">{r.sub}</span>
              </span>
              <span className="text-right">
                <span className="block text-xs text-muted">{r.label}</span>
                <span className="text-sm font-semibold tabular-nums">{r.value}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ol>
      {more ? (
        <Link href={more} className="border-t border-border py-3 text-center text-sm font-medium text-brand hover:underline">
          Se topp 10 ›
        </Link>
      ) : null}
    </section>
  );
}

export function Tile({ href, icon, label, sub, tone = "mint" }: { href: string; icon: ReactNode; label: string; sub?: string; tone?: "mint" | "warn" }) {
  return (
    <Link href={href} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <span className={cn("flex h-20 items-center justify-center text-3xl", tone === "mint" ? "bg-mint text-pos" : "bg-warn/15 text-warn")}>{icon}</span>
      <span className="px-3 py-3 text-center text-sm">
        {label}
        {sub ? <span className="block text-xs text-muted">{sub}</span> : null}
      </span>
    </Link>
  );
}

export function ShortcutCard({ href, icon, title, text }: { href: string; icon: ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="card flex items-center gap-4 p-4 transition hover:shadow-md">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-pos">{icon}</span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted">{text}</span>
      </span>
    </Link>
  );
}

export function RiskBars({ value }: { value: number | null | undefined }) {
  return (
    <span className="inline-flex gap-0.5" title={value ? `Risk ${value} av 7` : "Risk saknas"}>
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <span key={n} className={cn("h-3 w-1.5 rounded-sm", value && n <= value ? "bg-pos" : "bg-border")} />
      ))}
    </span>
  );
}

export function Stars({ value }: { value: number | null }) {
  if (!value) return <span className="text-muted">–</span>;
  return (
    <span className="text-pos" title={`${value} av 5`}>
      {"★".repeat(value)}
      <span className="text-border">{"★".repeat(5 - value)}</span>
    </span>
  );
}
