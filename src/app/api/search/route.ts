import { NextResponse } from "next/server";
import { searchInstruments } from "@/lib/search";
import { instrumentPath } from "@/lib/utils";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const rows = await searchInstruments(q, 8);
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      ticker: r.ticker,
      type: r.type,
      currency: r.currency,
      href: instrumentPath(r),
      last: r.quote?.last ?? null,
      changePct: r.quote?.changePct ?? null,
    })),
  );
}
