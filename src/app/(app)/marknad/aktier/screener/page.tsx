import { AKTIE_TABS, HandlaTabs, RiskNotice } from "@/components/handla/common";
import { Screener } from "@/components/handla/screener";
import { stockRows } from "@/lib/handla-data";

export const metadata = { title: "Aktiescreener" };

export default async function ScreenerPage({ searchParams }: PageProps<"/marknad/aktier/screener">) {
  const sp = await searchParams;
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const { screener } = await stockRows();
  return (
    <div className="mx-auto max-w-6xl">
      <HandlaTabs title="Handla aktier" tabs={AKTIE_TABS} active="screener" />
      <RiskNotice />
      <Screener rows={screener} initial={{ sort: s("sort"), lista: s("lista"), sektor: s("sektor"), q: s("q") }} />
    </div>
  );
}
