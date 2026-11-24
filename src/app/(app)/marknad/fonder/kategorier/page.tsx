import { Building2, Compass, Cpu, LineChart, Sprout, Store } from "lucide-react";
import { FOND_TABS, HandlaTabs, Tile } from "@/components/handla/common";
import { fundRows } from "@/lib/handla-data";
import { FUND_REGIONS, FUND_THEMES } from "@/lib/fund-tags";
import { FundMore } from "../page";

export const metadata = { title: "Fondkategorier" };

const THEME_ICON = { hallbar: Sprout, teknik: Cpu, smabolag: Store, fastighet: Building2, index: LineChart, aktiv: Compass } as const;

export default async function FundCategories() {
  const rows = await fundRows();
  const count = (k: string) => rows.filter((r) => r.tags.includes(k)).length;
  const href = (k: string) => `/marknad/fonder/lista?kategori=${k}`;
  return (
    <div className="mx-auto max-w-6xl">
      <HandlaTabs title="Handla fonder" tabs={FOND_TABS} active="kat" />
      <h2 className="mb-3 font-semibold">Länder och regioner</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FUND_REGIONS.map((r) => (
          <Tile key={r.key} href={href(r.key)} icon={r.icon} label={r.label} sub={`${count(r.key)} fonder`} />
        ))}
      </div>
      <h2 className="mb-3 font-semibold">Branscher och teman</h2>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FUND_THEMES.map((t) => {
          const I = THEME_ICON[t.key];
          return <Tile key={t.key} href={href(t.key)} icon={<I className="h-8 w-8" />} label={t.label} sub={`${count(t.key)} fonder`} />;
        })}
      </div>
      <FundMore />
    </div>
  );
}
