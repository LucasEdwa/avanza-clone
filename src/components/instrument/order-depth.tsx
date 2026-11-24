import { num, price } from "@/lib/format";
import { roundToTick, tickSize } from "@/lib/ticks";

const minuteSeed = () => Math.floor(Date.now() / 60000);

function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Order depth built around the real bid/ask using the instrument's tick size.
 * Free data sources do not publish level-2 depth, so volumes are simulated.
 */
export function OrderDepth({ symbol, bid, ask, last, avgVolume, currency }: { symbol: string; bid: number | null; ask: number | null; last: number | null; avgVolume: number | null; currency: string }) {
  if (!last) return null;
  const t = tickSize(last, currency);
  const b0 = bid ?? roundToTick(last - t, currency, "down");
  const a0 = ask && ask > b0 ? ask : roundToTick(b0 + t, currency, "up");
  const seedBase = [...symbol].reduce((s, c) => s + c.charCodeAt(0), 0) + minuteSeed();
  const scale = Math.max(50, Math.round((avgVolume ?? 100000) / 400));
  const levels = Array.from({ length: 5 }, (_, i) => ({
    bidP: b0 - i * t,
    askP: a0 + i * t,
    bidV: Math.round(scale * (0.3 + rand(seedBase + i) * (1 + i * 0.6))),
    askV: Math.round(scale * (0.3 + rand(seedBase + 50 + i) * (1 + i * 0.6))),
  }));
  const max = Math.max(...levels.flatMap((l) => [l.bidV, l.askV]));
  const sb = levels.reduce((s, l) => s + l.bidV, 0);
  const sa = levels.reduce((s, l) => s + l.askV, 0);
  return (
    <div>
      <div className="mb-2 flex h-2 overflow-hidden rounded-full">
        <div className="bg-pos" style={{ width: `${(sb / (sb + sa)) * 100}%` }} />
        <div className="bg-neg" style={{ width: `${(sa / (sb + sa)) * 100}%` }} />
      </div>
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr className="text-xs text-muted">
            <th className="py-1 text-left font-medium">Antal</th>
            <th className="py-1 text-right font-medium">Köp</th>
            <th className="py-1 pl-3 text-left font-medium">Sälj</th>
            <th className="py-1 text-right font-medium">Antal</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((l, i) => (
            <tr key={i}>
              <td className="relative py-1">
                <span className="absolute inset-y-0.5 right-0 rounded-l bg-pos-soft" style={{ width: `${(l.bidV / max) * 100}%` }} />
                <span className="relative">{num(l.bidV, 0)}</span>
              </td>
              <td className="py-1 text-right font-medium text-pos">{price(l.bidP)}</td>
              <td className="py-1 pl-3 font-medium text-neg">{price(l.askP)}</td>
              <td className="relative py-1 text-right">
                <span className="absolute inset-y-0.5 left-0 rounded-r bg-neg-soft" style={{ width: `${(l.askV / max) * 100}%` }} />
                <span className="relative">{num(l.askV, 0)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-muted">Bästa köp/sälj från marknadsdata. Djup och volymer är simulerade.</p>
    </div>
  );
}
