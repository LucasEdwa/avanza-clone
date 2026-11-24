import type { Instrument } from "@/db/schema";

export const FUND_REGIONS = [
  { key: "sverige", label: "Sverige", icon: "🇸🇪" },
  { key: "global", label: "Global", icon: "🌍" },
  { key: "usa", label: "USA", icon: "🇺🇸" },
  { key: "tillvaxt", label: "Tillväxtmarknader", icon: "🌏" },
  { key: "europa", label: "Europa", icon: "🇪🇺" },
  { key: "japan", label: "Japan", icon: "🇯🇵" },
  { key: "indien", label: "Indien", icon: "🇮🇳" },
] as const;

export const FUND_THEMES = [
  { key: "hallbar", label: "Miljö och hållbarhet" },
  { key: "teknik", label: "Ny teknik" },
  { key: "smabolag", label: "Små och medelstora bolag" },
  { key: "fastighet", label: "Fastighetsbolag" },
  { key: "index", label: "Indexfonder" },
  { key: "aktiv", label: "Aktivt förvaltade" },
] as const;

/** Derives region/theme tags from the fund's category and name. */
export function fundTags(f: Pick<Instrument, "fundCategory" | "name">): Set<string> {
  const c = `${f.fundCategory ?? ""} ${f.name}`.toLowerCase();
  const t = new Set<string>();
  if (/sverige|allabolag|investmentbolag/.test(c)) t.add("sverige");
  if (/global|all countries|världs|time global/.test(c) && !/emerging|tillväxt/.test(c)) t.add("global");
  if (/usa/.test(c)) t.add("usa");
  if (/tillväxt|emerging/.test(c)) t.add("tillvaxt");
  if (/europa/.test(c)) t.add("europa");
  if (/japan/.test(c)) t.add("japan");
  if (/indien/.test(c)) t.add("indien");
  if (/teknik|technology|ny teknik/.test(c)) t.add("teknik");
  if (/småbolag|smabolag/.test(c)) t.add("smabolag");
  if (/fastighet/.test(c)) t.add("fastighet");
  if (/hållbar|impact|miljö/.test(c)) t.add("hallbar");
  if (/index/.test(c)) t.add("index");
  else t.add("aktiv");
  return t;
}
