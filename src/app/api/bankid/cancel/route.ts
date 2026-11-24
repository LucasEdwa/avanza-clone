import { NextResponse } from "next/server";
import { cancelBankId } from "@/lib/bankid/service";

export async function POST(req: Request) {
  const { orderRef } = await req.json();
  if (orderRef) await cancelBankId(orderRef);
  return NextResponse.json({ ok: true });
}
