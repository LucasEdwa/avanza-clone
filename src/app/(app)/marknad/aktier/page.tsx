import { BadgePercent, Banknote, Building2, Cpu, Factory, FlaskConical, Fuel, GraduationCap, HeartPulse, Landmark, Pickaxe, Rocket, ShoppingBag, Sparkles, TrendingDown, TrendingUp, Trophy, Users, Zap } from "lucide-react";
import { AKTIE_TABS, HandlaTabs, ShortcutCard, Tile } from "@/components/handla/common";
import { stockRows } from "@/lib/handla-data";
import { pct, price, trendClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Aktieinspiration" };

const SECTOR_ICON: Record<string, typeof Zap> = {
  Industri: Factory,
  Teknik: Cpu,
  Finans: Landmark,
  Hälsovård: HeartPulse,
  Sällanköpsvaror: ShoppingBag,
  Dagligvaror: ShoppingBag,
  Råvaror: Pickaxe,
  Fastigheter: Building2,
  "Telekom & media": Zap,
  Energi: Fuel,
  Kraftförsörjning: Zap,
};

export default async function StockInspiration() {
  const { screener } = await stockRows();
  const sectors = new Map<string, typeof screener>();
  for (const r of screener) if (r.sector) sectors.set(r.sector, [...(sectors.get(r.sector) ?? []), r]);
  const sorted = [...sectors.entries()].sort((a, b) => b[1].length - a[1].length);
  const sc = (q: string) => `/marknad/aktier/screener?${q}`;
  return (
    <div className="mx-auto max-w-6xl">
      <HandlaTabs title="Handla aktier" tabs={AKTIE_TABS} active="insp" />
      <p className="mb-6 text-sm text-muted">Hitta din nästa aktie. Börja i en topplista, ett land eller en bransch, eller kombinera filter i aktiescreenern.</p>

      <h2 className="mb-3 font-semibold">Topplistor</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Tile href={sc("sort=-owners")} icon={<Users />} label="Mest ägda aktierna" />
        <Tile href={sc("sort=-dy")} icon={<BadgePercent />} label="Högst direktavkastning" />
        <Tile href={sc("sort=-today&lista=Large%20Cap")} icon={<TrendingUp />} label="Dagens vinnare Stockholm" />
        <Tile href={sc("sort=today&lista=Large%20Cap")} icon={<TrendingDown />} label="Dagens förlorare Stockholm" />
        <Tile href={sc("sort=-ytd")} icon={<Trophy />} label="Bäst i år" />
        <Tile href={sc("sort=-y3")} icon={<Rocket />} label="Bäst på 3 år" />
      </div>

      <h2 className="mb-3 font-semibold">Länder & regioner</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Tile href={sc("lista=Large%20Cap")} icon="🇸🇪" label="Sverige Large Cap" />
        <Tile href={sc("lista=Mid%20Cap")} icon="🇸🇪" label="Sverige Mid Cap" />
        <Tile href={sc("lista=USA")} icon="🇺🇸" label="USA" />
        <Tile href={sc("lista=DK")} icon="🇩🇰" label="Danmark" />
        <Tile href={sc("lista=NO")} icon="🇳🇴" label="Norge" />
        <Tile href={sc("sort=-cap")} icon={<Sparkles />} label="Storbolagen" />
      </div>

      <h2 className="mb-3 font-semibold">Populära branscher</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {sorted.slice(0, 6).map(([s, list]) => {
          const I = SECTOR_ICON[s] ?? FlaskConical;
          return <Tile key={s} href={sc(`sektor=${encodeURIComponent(s)}`)} icon={<I />} label={s} sub={`${list.length} aktier`} />;
        })}
      </div>

      <h2 className="mb-3 font-semibold">Alla branscher</h2>
      <div className="card mb-8 divide-y divide-border">
        {sorted.map(([s, list]) => (
          <details key={s} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm">
              {s} <span className="text-xs text-muted">{list.length} aktier ▾</span>
            </summary>
            <ul className="grid gap-x-6 px-4 pb-3 text-sm sm:grid-cols-2">
              {[...list].sort((a, b) => (b.capSek ?? 0) - (a.capSek ?? 0)).map((r) => (
                <li key={r.id}>
                  <Link href={r.href} className="flex justify-between py-1.5 hover:text-brand">
                    <span className="truncate pr-2">{r.name}</span>
                    <span className="flex gap-3 tabular-nums">
                      <span>{price(r.last)}</span>
                      <span className={cn("w-16 text-right", trendClass(r.today))}>{pct(r.today)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      <h2 className="mb-3 font-semibold">Genvägar</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <ShortcutCard href="/info/emissioner" icon={<Banknote className="h-5 w-5" />} title="Erbjudanden från bolag" text="Börsintroduktioner och emissioner" />
        <ShortcutCard href="/info/skolan" icon={<GraduationCap className="h-5 w-5" />} title="Spira-skolan" text="Lär dig mer om aktier och sparande" />
        <ShortcutCard href="/info/aktier" icon={<TrendingUp className="h-5 w-5" />} title="Kom igång med aktier" text="Så gör du din första aktieaffär" />
      </div>
    </div>
  );
}
