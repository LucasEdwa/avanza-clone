import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST() {
  const s = await getSession();
  return NextResponse.json({ ok: !!s, expiresAt: s?.expiresAt ?? null }, { status: s ? 200 : 401 });
}
