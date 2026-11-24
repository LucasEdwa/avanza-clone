import Link from "next/link";
import { notFound } from "next/navigation";
import { Search, Info } from "lucide-react";
import { RiskNotice } from "@/components/handla/common";

const TYPES: Record<string, { title: string; cols: string[]; text: string; info: string }> = {
  trackers: { title: "Certifikat – Trackers", cols: ["Namn", "Riktning", "Underliggande", "Hävstång", "Spread", "Köp", "Sälj", "Omsättning"], text: "Trackers följer en underliggande tillgång utan hävstång.", info: "/info/trackers" },
  "bull-bear": { title: "Certifikat – Bull & Bear", cols: ["Namn", "Riktning", "Underliggande", "Hävstång", "Spread", "Köp", "Sälj", "Omsättning"], text: "Bull & Bear har daglig fast hävstång, uppåt eller nedåt.", info: "/info/bull-bear" },
  "mini-futures": { title: "Warranter – Mini Futures", cols: ["Namn", "Riktning", "Underliggande", "Ind. häv.", "Stop loss", "Fin. nivå", "Spread", "Köp", "Sälj", "Omsättning"], text: "Mini Futures har en stop loss-nivå där produkten förfaller.", info: "/info/mini-futures" },
  turbos: { title: "Warranter – Unlimited Turbos", cols: ["Namn", "Riktning", "Underliggande", "Ind. häv.", "Knock out", "Fin. nivå", "Spread", "Köp", "Sälj", "Omsättning"], text: "Turbos har ingen löptid men förfaller vid knock out-nivån.", info: "/info/turbos" },
  optioner: { title: "Optioner & terminer", cols: ["Underliggande", "+/-", "+/- %", "Senast", "Termin", "Köpoptioner", "Lösen", "Säljoptioner", "Slutdag"], text: "Standardiserade optioner och terminer på svenska aktier och index.", info: "/info/optioner" },
  obligationer: { title: "Obligationer", cols: ["Namn", "Utv. idag", "Köp", "Sälj", "Senast", "Högst", "Lägst", "Börspost", "Antal"], text: "Stats- och företagsobligationer noterade på Nasdaq Stockholm.", info: "/info/obligationer" },
  ratter: { title: "Rätter, teckningsoptioner & BTA", cols: ["Namn", "Utv. idag", "Utv. idag %", "Köp", "Sälj", "Senast", "Högst", "Lägst", "Antal"], text: "Teckningsrätter, teckningsoptioner och betalda tecknade aktier som handlas just nu.", info: "/info/ratter-teckningsoptioner" },
};

export async function generateMetadata({ params }: PageProps<"/marknad/produkter/[typ]">) {
  const t = TYPES[(await params).typ];
  return { title: t?.title ?? "Produkter" };
}

export default async function ProductList({ params }: PageProps<"/marknad/produkter/[typ]">) {
  const { typ } = await params;
  const t = TYPES[typ];
  if (!t) notFound();
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-1 text-3xl font-bold tracking-tight">{t.title}</h1>
      <p className="mb-5 text-sm text-muted">{t.text}</p>
      <RiskNotice />
      <label className="mb-4 flex w-full items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 sm:w-64">
        <Search className="h-4 w-4 text-muted" />
        <input placeholder="Sök på namn" className="w-full bg-transparent text-sm outline-none" aria-label="Sök på namn" disabled />
      </label>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              {t.cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={t.cols.length} className="!py-12 text-center !whitespace-normal">
                <Info className="mx-auto mb-2 h-6 w-6 text-muted" />
                <div className="font-medium">Inga produkter att visa</div>
                <div className="mx-auto mt-1 max-w-md text-sm text-muted">
                  Det finns ingen fri datakälla för den här produkttypen, så den går inte att handla i Spira ännu.{" "}
                  <Link href={t.info} className="text-brand underline">
                    Läs mer om produkten
                  </Link>
                  .
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
