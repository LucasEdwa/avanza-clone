import { NextResponse } from "next/server";
import { liveQuotesByIds } from "@/lib/market/live";

export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 200);
  const q = await liveQuotesByIds(ids);
  return NextResponse.json(Object.fromEntries(q), { headers: { "Cache-Control": "no-store" } });
}
