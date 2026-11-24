import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { pct, signed, sek, trendClass } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function Card({ className, children, title, action }: { className?: string; children: ReactNode; title?: ReactNode; action?: ReactNode }) {
  return (
    <section className={cn("card", className)}>
      {title ? (
        <div className="flex items-center justify-between gap-2 px-4 pt-4 sm:px-5">
          <h2 className="h2">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle, actions, back }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {back ? (
          <Link href={back.href} className="mb-1 inline-block text-sm text-muted hover:text-fg">
            ← {back.label}
          </Link>
        ) : null}
        <h1 className="h1">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Change({ value, kind = "pct", className, arrow }: { value: number | null | undefined; kind?: "pct" | "sek" | "num"; className?: string; arrow?: boolean }) {
  const txt = kind === "pct" ? pct(value) : kind === "sek" ? `${value && value > 0 ? "+" : ""}${sek(value)}` : signed(value);
  return (
    <span className={cn("tabular-nums", trendClass(value), className)}>
      {arrow && value ? value > 0 ? <ArrowUpRight className="mr-0.5 inline h-4 w-4" /> : <ArrowDownRight className="mr-0.5 inline h-4 w-4" /> : null}
      {txt}
    </span>
  );
}

export function ChangePill({ value }: { value: number | null | undefined }) {
  return (
    <span
      className={cn(
        "badge tabular-nums",
        value == null || value === 0 ? "bg-surface-2 text-muted" : value > 0 ? "bg-pos-soft text-pos" : "bg-neg-soft text-neg",
      )}
    >
      {pct(value)}
    </span>
  );
}

export function Stat({ label, value, sub, className }: { label: ReactNode; value: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 font-semibold tabular-nums">{value}</div>
      {sub ? <div className="text-xs">{sub}</div> : null}
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="font-semibold">{title}</div>
      {children ? <div className="max-w-md text-sm text-muted">{children}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function LinkTabs({ tabs, active }: { tabs: { href: string; label: string; key: string }[]; active: string }) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap",
            t.key === active ? "border-brand text-fg" : "border-transparent text-muted hover:text-fg",
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export function Chips({ items, active }: { items: { href: string; label: string; key: string }[]; active: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <Link key={i.key} href={i.href} className={cn("chip", i.key === active && "chip-active")}>
          {i.label}
        </Link>
      ))}
    </div>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "warn" | "error" | "success"; children: ReactNode }) {
  const c = {
    info: "border-brand/30 bg-brand-soft text-fg",
    warn: "border-warn/40 bg-warn/10 text-fg",
    error: "border-neg/30 bg-neg-soft text-neg",
    success: "border-pos/30 bg-pos-soft text-pos",
  }[kind];
  return <div className={cn("rounded-xl border px-3 py-2 text-sm", c)}>{children}</div>;
}

export function InstrumentAvatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter((w) => /^[A-Za-zÅÄÖåäö0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{ width: size, height: size, background: `hsl(${h} 55% 45%)` }}
    >
      {initials || "?"}
    </span>
  );
}

export function RiskScale({ value }: { value: number | null | undefined }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <span
          key={n}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded text-xs font-semibold",
            n === value ? "bg-brand text-brand-fg" : "bg-surface-2 text-muted",
          )}
        >
          {n}
        </span>
      ))}
    </div>
  );
}
