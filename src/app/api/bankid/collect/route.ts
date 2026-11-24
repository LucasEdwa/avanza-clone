import { NextResponse } from "next/server";
import { collectBankId } from "@/lib/bankid/service";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderRef = url.searchParams.get("orderRef");
  if (!orderRef) return NextResponse.json({ error: "orderRef saknas" }, { status: 400 });
  try {
    const r = await collectBankId(orderRef, { qr: url.searchParams.get("qr") === "1" });
    return NextResponse.json(r, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ status: "failed", hintCode: "unknown", message: (e as Error).message }, { status: 200 });
  }
}
