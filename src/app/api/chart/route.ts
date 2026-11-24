import { NextResponse } from "next/server";
import { getChart, RANGES, type Range } from "@/lib/market/data";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const symbol = u.searchParams.get("symbol");
  const range = (u.searchParams.get("range") ?? "1D") as Range;
  if (!symbol || !RANGES.includes(range)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  return NextResponse.json(await getChart(symbol, range));
}
