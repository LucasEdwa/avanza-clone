import { NextResponse } from "next/server";
import { simConfirm, simulatorEnabled } from "@/lib/bankid/simulator";

export async function POST(req: Request) {
  if (!simulatorEnabled()) return NextResponse.json({ error: "Simulatorn är avstängd" }, { status: 404 });
  const { orderRef, securityCode } = await req.json();
  try {
    await simConfirm(orderRef, securityCode);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
