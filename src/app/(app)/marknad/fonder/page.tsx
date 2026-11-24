import { ArrowRightLeft, GraduationCap, HandCoins } from "lucide-react";
import { FOND_TABS, HandlaTabs, RiskNotice, ShortcutCard, TopList } from "@/components/handla/common";
import { fundRows } from "@/lib/handla-data";
import { num, pct } from "@/lib/format";
import type { FundRow } from "@/components/handla/fund-table";

export const metadata = { title: "Handla fonder" };

const sub = (f: FundRow) => (
  <>
    Utv. 3 år <span className="text-brand">{pct(f.y3 ?? null, 2, false)}</span>
  </>
);

export function FundMore() {
  return (
    <>
      <h2 className="mt-10 mb-3 font-semibold">Mer om fonder</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <ShortcutCard href="/info/fonder" icon={<HandCoins className="h-5 w-5" />} title="Börja spara i fonder" text="Ny på fonder? Vi visar hur du kommer igång" />
        <ShortcutCard href="/info/skolan" icon={<GraduationCap className="h-5 w-5" />} title="Lär dig allt om fonder" text="Korta lektioner i Spira-skolan" />
        <ShortcutCard href="/info/flytta-vardepapper" icon={<ArrowRightLeft className="h-5 w-5" />} title="Flytta hit dina fonder" text="Så flyttar du fonder från en annan bank" />
      </div>
    </>
  );
}

export default async function FundInspiration() {
  const rows = await fundRows();
  const top = (list: FundRow[], label: string, val: (f: FundRow) => React.ReactNode) => list.slice(0, 5).map((f) => ({ href: f.href, name: f.name, sub: sub(f), label, value: val(f) }));
  const index = rows.filter((f) => f.tags.includes("index"));
  const active = rows.filter((f) => f.tags.includes("aktiv"));
  return (
    <div className="mx-auto max-w-6xl">
      <HandlaTabs title="Handla fonder" tabs={FOND_TABS} active="insp" />
      <RiskNotice />
      <h2 className="mb-3 font-semibold">Topplistor</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <TopList title="Mest köpt senaste dygnet" more="/marknad/fonder/lista?sort=-owners" rows={top([...rows].sort((a, b) => b.owners - a.owners), "Ägare", (f) => num(f.owners, 0))} />
        <TopList title="Indexfonder med lägst avgift" more="/marknad/fonder/lista?kategori=index&sort=fee" rows={top([...index].sort((a, b) => (a.fee ?? 9) - (b.fee ?? 9)), "Total avgift", (f) => `${num(f.fee, 2)} %`)} />
        <TopList title="Bäst avkastning 3 år" more="/marknad/fonder/lista?sort=-y3" rows={top([...rows].sort((a, b) => (b.y3 ?? -999) - (a.y3 ?? -999)), "Utv. 3 år", (f) => <span className="text-brand">{pct(f.y3, 2, false)}</span>)} />
      </div>
      <h2 className="mt-8 mb-3 font-semibold">Populäraste fonderna</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <TopList title="Fonder som följer index" more="/marknad/fonder/lista?kategori=index&sort=-owners" rows={top([...index].sort((a, b) => b.owners - a.owners || (b.y3 ?? 0) - (a.y3 ?? 0)), "Ägare", (f) => `${num(f.owners, 0)} st`)} />
        <TopList title="Aktivt förvaltade fonder" more="/marknad/fonder/lista?kategori=aktiv&sort=-owners" rows={top([...active].sort((a, b) => b.owners - a.owners || (b.y3 ?? 0) - (a.y3 ?? 0)), "Ägare", (f) => `${num(f.owners, 0)} st`)} />
        <TopList title="Fonderna med högst betyg" more="/marknad/fonder/lista?sort=-rating" rows={top([...rows].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.y3 ?? 0) - (a.y3 ?? 0)), "Spira-betyg", (f) => <span className="text-pos">{"★".repeat(f.rating ?? 0)}</span>)} />
      </div>
      <FundMore />
    </div>
  );
}
