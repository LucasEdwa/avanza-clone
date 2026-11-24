import { NextResponse } from "next/server";
import { clientIp } from "@/lib/auth";
import { startBankId } from "@/lib/bankid/service";

export async function POST() {
  try {
    const r = await startBankId({ intent: "auth", ip: await clientIp() });
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
