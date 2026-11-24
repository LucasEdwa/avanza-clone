/** Simplified tick size table (Nasdaq Nordic, liquid band) – USD/EUR stocks use cents. */
const TABLE: [number, number][] = [
  [1, 0.0002],
  [2, 0.0005],
  [5, 0.001],
  [10, 0.002],
  [20, 0.005],
  [50, 0.01],
  [100, 0.02],
  [200, 0.05],
  [500, 0.1],
  [1000, 0.2],
  [2000, 0.5],
  [5000, 1],
  [Infinity, 2],
];

export function tickSize(price: number, currency = "SEK"): number {
  if (currency === "USD" || currency === "EUR") return price < 1 ? 0.0001 : 0.01;
  for (const [lim, t] of TABLE) if (price < lim) return t;
  return 2;
}

export function roundToTick(price: number, currency = "SEK", mode: "nearest" | "up" | "down" = "nearest"): number {
  const t = tickSize(price, currency);
  const n = price / t;
  const r = mode === "up" ? Math.ceil(n - 1e-9) : mode === "down" ? Math.floor(n + 1e-9) : Math.round(n);
  return Number((r * t).toFixed(6));
}

export function isOnTick(price: number, currency = "SEK"): boolean {
  const t = tickSize(price, currency);
  return Math.abs(price / t - Math.round(price / t)) < 1e-6;
}

export function tickDecimals(price: number, currency = "SEK"): number {
  const t = tickSize(price, currency);
  return Math.max(2, Math.ceil(-Math.log10(t) - 1e-9));
}
