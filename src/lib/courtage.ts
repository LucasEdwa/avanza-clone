export type CourtageClass = "START" | "MINI" | "SMALL" | "MEDIUM" | "FAST_PRIS";

export const COURTAGE_CLASSES: Record<
  CourtageClass,
  { label: string; pct: number; min: number; fixed?: number; description: string }
> = {
  START: {
    label: "Start",
    pct: 0,
    min: 0,
    description: "0 kr courtage på köp och sälj upp till totalt 50 000 kr handlad volym. Därefter Mini.",
  },
  MINI: { label: "Mini", pct: 0.0025, min: 1, description: "0,25 %, lägst 1 kr. Passar affärer upp till ca 15 600 kr." },
  SMALL: { label: "Small", pct: 0.0015, min: 39, description: "0,15 %, lägst 39 kr. Passar affärer mellan 15 600 och 46 000 kr." },
  MEDIUM: {
    label: "Medium",
    pct: 0.00069,
    min: 69,
    description: "0,069 %, lägst 69 kr. Passar affärer mellan 46 000 och 143 500 kr.",
  },
  FAST_PRIS: { label: "Fast pris", pct: 0, min: 99, fixed: 99, description: "99 kr per affär oavsett belopp." },
};

export const START_CLASS_LIMIT_SEK = 50_000;
export const FX_FEE_PCT = 0.0025;

/** Courtage in SEK for a stock/ETF trade of `valueSek`. */
export function calcCourtage(cls: CourtageClass, valueSek: number, tradedVolumeSek = 0): number {
  if (valueSek <= 0) return 0;
  if (cls === "START") {
    if (tradedVolumeSek + valueSek <= START_CLASS_LIMIT_SEK) return 0;
    cls = "MINI";
  }
  const c = COURTAGE_CLASSES[cls];
  if (c.fixed != null) return c.fixed;
  return Math.round(Math.max(c.min, valueSek * c.pct) * 100) / 100;
}

export function calcFxFee(valueSek: number, currency: string): number {
  if (currency === "SEK") return 0;
  return Math.round(valueSek * FX_FEE_PCT * 100) / 100;
}
