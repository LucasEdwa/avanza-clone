import { NextResponse } from "next/server";
import { pendingOrders, resolveOrder, simulatorEnabled } from "@/lib/bankid/simulator";

export async function GET(req: Request) {
  if (!simulatorEnabled()) return NextResponse.json({ error: "Simulatorn är avstängd" }, { status: 404 });
  const url = new URL(req.url);
  const token = url.searchParams.get("autostarttoken");
  const qr = url.searchParams.get("qr");
  try {
    if (token || qr) {
      const o = await resolveOrder({ autoStartToken: token ?? undefined, qr: qr ?? undefined });
      return NextResponse.json({
        order: { orderRef: o.orderRef, intent: o.intent, status: o.status, requiredPersonalNumber: o.requiredPersonalNumber },
      });
    }
    return NextResponse.json({ orders: await pendingOrders() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
