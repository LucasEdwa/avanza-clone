import { cached } from "./cache";
import { yf, loose } from "./yahoo";

export type Perf = { m1: number | null; m3: number | null; ytd: number | null; y1: number | null; y3: number | null; y5: number | null };
const EMPTY: Perf = { m1: null, m3: null, ytd: null, y1: null, y3: null, y5: null };

type ChartResult = { quotes?: { date: Date | string; close: number | null }[] };

/** Historical returns from ~6 years of weekly closes (cached 12 h per symbol). */
export async function getPerf(symbol: string): Promise<Perf> {
  const p = await cached<Perf>(`perf:${symbol}`, 12 * 3600_000, async () => {
    const r = (await yf.chart(symbol, { period1: new Date(Date.now() - 6 * 366 * 86400_000), interval: "1wk" }, loose)) as ChartResult;
    const pts = (r.quotes ?? []).filter((q) => q.close != null).map((q) => ({ t: new Date(q.date).getTime(), v: q.close as number }));
    if (pts.length < 2) return EMPTY;
    const last = pts[pts.length - 1];
    const at = (msAgo: number) => {
      const target = last.t - msAgo;
      let best: (typeof pts)[number] | null = null;
      for (const p of pts) if (p.t <= target) best = p;
      // require data reasonably close to the target date
      return best && target - best.t < 21 * 86400_000 ? best.v : null;
    };
    const ret = (v: number | null) => (v ? (last.v / v - 1) * 100 : null);
    const yStart = new Date(Date.UTC(new Date(last.t).getUTCFullYear(), 0, 1)).getTime();
    const DAY = 86400_000;
    return {
      m1: ret(at(30 * DAY)),
      m3: ret(at(91 * DAY)),
      ytd: ret(at(last.t - yStart + DAY)),
      y1: ret(at(365 * DAY)),
      y3: ret(at(3 * 365 * DAY)),
      y5: ret(at(5 * 365 * DAY)),
    };
  });
  return p ?? EMPTY;
}

export async function getPerfMany(symbols: string[], concurrency = 8): Promise<Map<string, Perf>> {
  const out = new Map<string, Perf>();
  let i = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (i < symbols.length) {
        const s = symbols[i++];
        out.set(s, await getPerf(s).catch(() => EMPTY));
      }
    }),
  );
  return out;
}
