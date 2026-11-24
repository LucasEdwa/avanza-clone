import { FOND_TABS, HandlaTabs, RiskNotice } from "@/components/handla/common";
import { FundTable } from "@/components/handla/fund-table";
import { fundFilters, fundRows } from "@/lib/handla-data";

export const metadata = { title: "Alla fonder" };

export default async function FundList({ searchParams }: PageProps<"/marknad/fonder/lista">) {
  const sp = await searchParams;
  const rows = await fundRows();
  return (
    <div className="mx-auto max-w-6xl">
      <HandlaTabs title="Handla fonder" tabs={FOND_TABS} active="lista" />
      <RiskNotice />
      <FundTable rows={rows} filters={fundFilters(rows)} initial={{ tag: typeof sp.kategori === "string" ? sp.kategori : undefined, sort: typeof sp.sort === "string" ? sp.sort : undefined }} />
    </div>
  );
}
