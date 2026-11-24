import { NextResponse } from "next/server";
import { simCancel, simulatorEnabled } from "@/lib/bankid/simulator";

export async function POST(req: Request) {
  if (!simulatorEnabled()) return NextResponse.json({ error: "Simulatorn är avstängd" }, { status: 404 });
  const { orderRef } = await req.json();
  await simCancel(orderRef);
  return NextResponse.json({ ok: true });
}
