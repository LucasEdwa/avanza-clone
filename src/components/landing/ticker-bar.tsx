import Link from "next/link";
import { inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { liveQuotes } from "@/lib/market/live";
import { num, pct } from "@/lib/format";
import { cn, instrumentPath } from "@/lib/utils";

const SYMBOLS = ["^OMX", "^OMXSPI", "^GSPC", "^IXIC", "^GDAXI", "USDSEK=X", "EURSEK=X", "GC=F", "BTC-USD"];

/** Thin strip of live index quotes shown above the public header. */
export async function TickerBar() {
  const rows = await db.select().from(schema.instruments).where(inArray(schema.instruments.symbol, SYMBOLS));
  const quotes = await liveQuotes(rows).catch(() => new Map());
  const list = SYMBOLS.map((s) => rows.find((r) => r.symbol === s)).filter((r): r is NonNullable<typeof r> => !!r);
  return (
    <div className="bg-[#11142a] text-white">
      <div className="mx-auto flex h-8 max-w-6xl items-center gap-6 overflow-x-auto px-4 text-[11px] whitespace-nowrap [scrollbar-width:none]">
        {list.map((i) => {
          const q = quotes.get(i.id);
          const up = (q?.changePct ?? 0) >= 0;
          return (
            <Link key={i.id} href={instrumentPath(i)} className="flex items-center gap-1.5 hover:opacity-80">
              <span className={cn("h-1.5 w-1.5 rounded-full", up ? "bg-emerald-400" : "bg-rose-400")} />
              <span className="font-semibold">{i.ticker}</span>
              <span className="tabular-nums opacity-80">{num(q?.last, 2)}</span>
              <span className={cn("tabular-nums", up ? "text-emerald-400" : "text-rose-400")}>{pct(q?.changePct)}</span>
            </Link>
          );
        })}
        <Link href="/marknad" className="ml-auto font-semibold text-violet-300 hover:text-white">
          Marknaden idag →
        </Link>
      </div>
    </div>
  );
}
