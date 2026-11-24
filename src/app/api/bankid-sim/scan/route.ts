import { NextResponse } from "next/server";
import { simScan, simulatorEnabled } from "@/lib/bankid/simulator";

export async function POST(req: Request) {
  if (!simulatorEnabled()) return NextResponse.json({ error: "Simulatorn är avstängd" }, { status: 404 });
  const { orderRef, identity } = await req.json();
  try {
    return NextResponse.json(await simScan(orderRef, identity));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
