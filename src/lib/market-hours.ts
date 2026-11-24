/** Exchange opening hours, Swedish trading holidays, settlement dates. */

const STO_HOLIDAYS = new Set([
  // 2025
  "2025-01-01", "2025-01-06", "2025-04-18", "2025-04-21", "2025-05-01", "2025-05-29", "2025-06-06",
  "2025-06-20", "2025-12-24", "2025-12-25", "2025-12-26", "2025-12-31",
  // 2026
  "2026-01-01", "2026-01-06", "2026-04-03", "2026-04-06", "2026-05-01", "2026-05-14", "2026-06-19",
  "2026-12-24", "2026-12-25", "2026-12-31",
  // 2027
  "2027-01-01", "2027-01-06", "2027-03-26", "2027-03-29", "2027-05-06", "2027-06-25",
  "2027-12-24", "2027-12-31",
]);

const US_HOLIDAYS = new Set([
  "2025-01-01", "2025-01-20", "2025-02-17", "2025-04-18", "2025-05-26", "2025-06-19", "2025-07-04",
  "2025-09-01", "2025-11-27", "2025-12-25",
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19", "2026-07-03",
  "2026-09-07", "2026-11-26", "2026-12-25",
  "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31", "2027-06-18", "2027-07-05",
  "2027-09-06", "2027-11-25", "2027-12-24",
]);

export type Venue = "STO" | "US" | "EU" | "OSL" | "CPH" | "HEL";

const VENUES: Record<Venue, { tz: string; open: [number, number]; close: [number, number]; holidays: Set<string> }> = {
  STO: { tz: "Europe/Stockholm", open: [9, 0], close: [17, 30], holidays: STO_HOLIDAYS },
  CPH: { tz: "Europe/Copenhagen", open: [9, 0], close: [17, 0], holidays: STO_HOLIDAYS },
  OSL: { tz: "Europe/Oslo", open: [9, 0], close: [16, 20], holidays: STO_HOLIDAYS },
  HEL: { tz: "Europe/Helsinki", open: [10, 0], close: [18, 30], holidays: STO_HOLIDAYS },
  EU: { tz: "Europe/Berlin", open: [9, 0], close: [17, 30], holidays: STO_HOLIDAYS },
  US: { tz: "America/New_York", open: [9, 30], close: [16, 0], holidays: US_HOLIDAYS },
};

export function venueForSymbol(symbol: string): Venue {
  if (symbol.endsWith(".ST")) return "STO";
  if (symbol.endsWith(".CO")) return "CPH";
  if (symbol.endsWith(".OL")) return "OSL";
  if (symbol.endsWith(".HE")) return "HEL";
  if (/\.(DE|F|PA|AS|MI|L)$/.test(symbol)) return "EU";
  return "US";
}

function partsIn(tz: string, d: Date) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)!.value;
  return {
    date: `${g("year")}-${g("month")}-${g("day")}`,
    hour: Number(g("hour")),
    minute: Number(g("minute")),
    weekday: g("weekday"),
  };
}

/** YYYY-MM-DD in Stockholm time. */
export function stockholmDate(d = new Date()): string {
  return partsIn("Europe/Stockholm", d).date;
}

export function isTradingDay(dateStr: string, venue: Venue = "STO"): boolean {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const wd = d.getUTCDay();
  if (wd === 0 || wd === 6) return false;
  return !VENUES[venue].holidays.has(dateStr);
}

export function isMarketOpen(venue: Venue = "STO", now = new Date()): boolean {
  const v = VENUES[venue];
  const p = partsIn(v.tz, now);
  if (!isTradingDay(p.date, venue)) return false;
  const mins = p.hour * 60 + p.minute;
  return mins >= v.open[0] * 60 + v.open[1] && mins < v.close[0] * 60 + v.close[1];
}

export function addTradingDays(dateStr: string, n: number, venue: Venue = "STO"): string {
  let d = new Date(`${dateStr}T12:00:00Z`);
  let left = n;
  while (left > 0) {
    d = new Date(d.getTime() + 86400000);
    if (isTradingDay(d.toISOString().slice(0, 10), venue)) left--;
  }
  return d.toISOString().slice(0, 10);
}

export function nextTradingDay(dateStr: string, venue: Venue = "STO"): string {
  return addTradingDays(dateStr, 1, venue);
}

/** Settlement (likviddag) – T+2 trading days. */
export function settlementDate(tradeDate = stockholmDate(), venue: Venue = "STO"): string {
  return addTradingDays(tradeDate, 2, venue);
}

/** Convert a Stockholm wall-clock time to a Date. */
export function stockholmTime(dateStr: string, hour: number, minute = 0): Date {
  // Find the UTC offset for that date in Stockholm (CET/CEST)
  const guess = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`);
  const p = partsIn("Europe/Stockholm", guess);
  const offsetMin = (p.hour - hour) * 60 + (p.minute - minute);
  return new Date(guess.getTime() - offsetMin * 60000);
}

/**
 * Fund orders: placed before 15:00 on a trading day are executed at that day's NAV
 * (we book them after 17:30), otherwise at the next trading day's NAV.
 */
export function fundExecutionTime(now = new Date()): Date {
  const p = partsIn("Europe/Stockholm", now);
  let day = p.date;
  if (!isTradingDay(day) || p.hour >= 15) day = nextTradingDay(day);
  return stockholmTime(day, 17, 45);
}

export function marketStatusText(venue: Venue = "STO", now = new Date()): string {
  return isMarketOpen(venue, now) ? "Öppen" : "Stängd";
}
