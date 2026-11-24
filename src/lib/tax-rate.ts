/**
 * Swedish standard taxation (schablonbeskattning) for ISK and KF.
 * Schablonränta = statslåneränta 30 Nov previous year + 1 percentage point (min 1.25 %),
 * taxed at 30 %. From 2026 the first 300 000 kr of the combined capital base is tax free.
 */
export const TAX_PARAMS: Record<number, { slr: number; taxFree: number; estimated: boolean }> = {
  2024: { slr: 2.62, taxFree: 0, estimated: false },
  2025: { slr: 1.96, taxFree: 150_000, estimated: false },
  2026: { slr: 2.55, taxFree: 300_000, estimated: true },
};

export function schablonRate(year: number) {
  const p = TAX_PARAMS[year] ?? TAX_PARAMS[2026];
  return Math.max(1.25, p.slr + 1);
}

