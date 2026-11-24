const nf = (min: number, max: number) =>
  new Intl.NumberFormat("sv-SE", { minimumFractionDigits: min, maximumFractionDigits: max });

const cache = new Map<string, Intl.NumberFormat>();
function fmt(min: number, max: number) {
  const k = `${min}-${max}`;
  let f = cache.get(k);
  if (!f) cache.set(k, (f = nf(min, max)));
  return f;
}

/** 1 234,56 */
export function num(v: number | null | undefined, decimals = 2, maxDecimals = decimals): string {
  if (v == null || Number.isNaN(v)) return "–";
  return fmt(decimals, maxDecimals).format(v).replace(/−/g, "-");
}

/** Price with sensible decimals based on magnitude. */
export function price(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "–";
  const a = Math.abs(v);
  const d = a >= 1000 ? 2 : a >= 1 ? 2 : 4;
  return num(v, d, Math.max(d, a < 10 ? 3 : 2));
}

/** 1 234,56 kr */
export function sek(v: number | null | undefined, decimals = 2): string {
  if (v == null || Number.isNaN(v)) return "–";
  return `${num(v, decimals)} kr`;
}

export function money(v: number | null | undefined, currency = "SEK", decimals = 2): string {
  if (v == null || Number.isNaN(v)) return "–";
  if (currency === "SEK") return sek(v, decimals);
  return `${num(v, decimals)} ${currency}`;
}

/** +1,23 % */
export function pct(v: number | null | undefined, decimals = 2, signed = true): string {
  if (v == null || Number.isNaN(v)) return "–";
  const s = num(v, decimals);
  return `${signed && v > 0 ? "+" : ""}${s} %`;
}

export function signed(v: number | null | undefined, decimals = 2): string {
  if (v == null || Number.isNaN(v)) return "–";
  return `${v > 0 ? "+" : ""}${num(v, decimals)}`;
}

/** 12,3 mdr / 456,7 mn */
export function compact(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "–";
  const a = Math.abs(v);
  if (a >= 1e12) return `${num(v / 1e12, 1)} bn`;
  if (a >= 1e9) return `${num(v / 1e9, 1)} mdr`;
  if (a >= 1e6) return `${num(v / 1e6, 1)} mn`;
  if (a >= 1e3) return `${num(v / 1e3, 1)} tn`;
  return num(v, 0);
}

export function trendClass(v: number | null | undefined): string {
  if (v == null || v === 0 || Number.isNaN(v)) return "text-muted";
  return v > 0 ? "text-pos" : "text-neg";
}

const tz = "Europe/Stockholm";
export function dateSv(d: Date | string | null | undefined): string {
  if (!d) return "–";
  return new Intl.DateTimeFormat("sv-SE", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(d),
  );
}
export function dateTimeSv(d: Date | string | null | undefined): string {
  if (!d) return "–";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}
export function timeSv(d: Date | string | null | undefined): string {
  if (!d) return "–";
  return new Intl.DateTimeFormat("sv-SE", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
    new Date(d),
  );
}
export function relativeSv(d: Date | string): string {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "nyss";
  if (diff < 3600) return `${Math.floor(diff / 60)} min sedan`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} tim sedan`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d sedan`;
  return dateSv(d);
}
