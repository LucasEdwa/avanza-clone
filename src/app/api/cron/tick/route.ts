import { NextResponse } from "next/server";
import { runTick } from "@/lib/ticker";

/** Background job endpoint: refresh quotes for instruments with active orders/alerts, match orders, run savings plans. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const host = new URL(req.url).hostname;
  if (!["localhost", "127.0.0.1"].includes(host) && auth !== `Bearer ${secret}`)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await runTick());
}
