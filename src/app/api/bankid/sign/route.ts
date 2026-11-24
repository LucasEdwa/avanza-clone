import { NextResponse } from "next/server";
import { clientIp, getUser } from "@/lib/auth";
import { startBankId } from "@/lib/bankid/service";
import { buildSignText, type SignRequest } from "@/lib/bankid/sign-actions";
import { getOnboarding } from "@/lib/signed-cookie";

export async function POST(req: Request) {
  const body = (await req.json()) as SignRequest;
  const user = await getUser();
  let pnr: string | undefined = user?.personalNumber;
  if (body.action === "agreement") {
    const ob = await getOnboarding();
    if (!ob) return NextResponse.json({ error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
    pnr = ob.pnr;
  } else if (!user) {
    return NextResponse.json({ error: "Inte inloggad" }, { status: 401 });
  }
  try {
    const text = await buildSignText(body, user?.id ?? null);
    const r = await startBankId({
      intent: "sign",
      ip: await clientIp(),
      userVisibleData: text,
      personalNumber: pnr,
      payload: { ...body, userId: user?.id, pnr },
    });
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
