import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import type { Block } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import { dateSv } from "@/lib/format";
import { Art, SmallIcon } from "./art";
import { WidgetView } from "./widgets";

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="text-2xl font-bold tracking-tight">{children}</h2>;

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <section key={i} className={cn("py-12", i % 2 === 1 ? "bg-mint" : "bg-surface")}>
          <div className="mx-auto max-w-6xl px-4">
            <BlockView b={b} />
          </div>
        </section>
      ))}
    </>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case "features":
      return (
        <div>
          {b.title ? <H2>{b.title}</H2> : null}
          {b.lead ? <p className="mt-2 max-w-3xl text-muted">{b.lead}</p> : null}
          <div className={cn("mt-6 grid gap-4 sm:grid-cols-2", b.cols === 4 ? "lg:grid-cols-4" : b.cols === 2 ? "" : "lg:grid-cols-3")}>
            {b.items.map((it) => {
              const inner = (
                <>
                  <SmallIcon name={it.icon} />
                  <div className="mt-3 font-semibold">{it.title}</div>
                  <p className="mt-1 text-sm text-muted">{it.text}</p>
                  {it.href ? <span className="mt-3 inline-flex items-center text-sm font-medium text-brand">Läs mer <ChevronRight className="h-4 w-4" /></span> : null}
                </>
              );
              return it.href ? (
                <Link key={it.title} href={it.href} className="card p-5 transition hover:shadow-md">
                  {inner}
                </Link>
              ) : (
                <div key={it.title} className="card p-5">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      );
    case "split":
      return (
        <div className={cn("grid items-center gap-10 md:grid-cols-2", b.reverse && "md:[&>*:first-child]:order-2")}>
          <div className="flex justify-center">
            <Art kind={b.art} size={240} />
          </div>
          <div>
            <H2>{b.title}</H2>
            <p className="mt-3 leading-relaxed text-muted">{b.text}</p>
            {b.bullets ? (
              <ul className="mt-4 space-y-2 text-sm">
                {b.bullets.map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-pos" />
                    {x}
                  </li>
                ))}
              </ul>
            ) : null}
            {b.cta ? (
              <Link href={b.cta.href} className="btn mt-6 bg-[#11142a] px-6 py-2.5 text-white hover:brightness-125 dark:bg-white dark:text-[#11142a]">
                {b.cta.label}
              </Link>
            ) : null}
          </div>
        </div>
      );
    case "steps":
      return (
        <div>
          <H2>{b.title}</H2>
          {b.lead ? <p className="mt-2 max-w-3xl text-muted">{b.lead}</p> : null}
          <ol className={cn("mt-6 grid gap-4", b.items.length > 3 ? "md:grid-cols-2 lg:grid-cols-" + Math.min(b.items.length, 5) : "md:grid-cols-3")}>
            {b.items.map((s, i) => (
              <li key={s.title} className="card p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-strong font-bold text-pos">{i + 1}</span>
                <div className="mt-3 font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      );
    case "faq":
      return (
        <div className="mx-auto max-w-3xl">
          <H2>{b.title ?? "Vanliga frågor"}</H2>
          <div className="card mt-5 divide-y divide-border">
            {b.items.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-90" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      );
    case "widget":
      return (
        <div>
          {b.title ? <H2>{b.title}</H2> : null}
          {b.lead ? <p className="mt-2 mb-5 max-w-3xl text-muted">{b.lead}</p> : <div className="mt-5" />}
          <WidgetView widget={b.widget} />
        </div>
      );
    case "table":
      return (
        <div>
          <H2>{b.title}</H2>
          {b.lead ? <p className="mt-2 max-w-3xl text-muted">{b.lead}</p> : null}
          <div className="card mt-5 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  {b.head.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j} className={cn("!whitespace-normal", j === 0 && "font-medium")}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {b.note ? <p className="mt-2 text-xs text-muted">{b.note}</p> : null}
        </div>
      );
    case "cards":
      return (
        <div>
          <H2>{b.title}</H2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {b.items.map((c) => (
              <Link key={c.title} href={c.href} className="card group overflow-hidden transition hover:shadow-md">
                <div className="h-2 bg-gradient-to-r from-brand to-pos" />
                <div className="p-5">
                  {c.tag ? <div className="text-xs font-semibold text-brand">{c.tag}</div> : null}
                  <div className="mt-1 font-semibold group-hover:text-brand">{c.title}</div>
                  <p className="mt-1 text-sm text-muted">{c.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      );
    case "band":
      return (
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-[#11142a] p-8 text-white md:flex-row md:items-center">
          <div>
            <div className="text-xl font-bold">{b.title}</div>
            <p className="mt-1 max-w-xl text-sm text-white/70">{b.text}</p>
          </div>
          <Link href={b.cta.href} className="btn bg-white px-6 py-2.5 text-[#11142a]">
            {b.cta.label}
          </Link>
        </div>
      );
    case "stats":
      return (
        <div>
          {b.title ? <H2>{b.title}</H2> : null}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {b.items.map((s) => (
              <div key={s.label} className="card p-5">
                <div className="text-3xl font-bold text-pos">{s.value}</div>
                <div className="mt-1 text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "text":
      return (
        <div className="max-w-3xl">
          <H2>{b.title}</H2>
          {b.paragraphs.map((p) => (
            <p key={p} className="mt-3 leading-relaxed text-muted">
              {p}
            </p>
          ))}
        </div>
      );
    case "news":
      return (
        <div className="max-w-3xl">
          <H2>{b.title}</H2>
          <ul className="mt-5 space-y-4">
            {b.items.map((n) => (
              <li key={n.title} className="card p-5">
                <div className="text-xs text-muted">{dateSv(n.date)}</div>
                <div className="mt-1 font-semibold">{n.title}</div>
                <p className="mt-1 text-sm text-muted">{n.text}</p>
                {n.href ? (
                  <Link href={n.href} className="mt-2 inline-flex items-center text-sm font-medium text-brand">
                    Testa nu <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      );
    case "notice":
      return <p className="text-sm text-muted">{b.text}</p>;
  }
}
