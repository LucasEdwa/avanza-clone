import {
  BookOpen, Briefcase, Building2, CalendarDays, ChartLine, Coins, Gift, Globe2, Handshake, Home, Leaf, MoveRight, Percent,
  PiggyBank, Rocket, ShieldCheck, Smartphone, Sprout, Umbrella, Baby,
} from "lucide-react";
import type { ArtKind } from "@/lib/content/types";

const ICON = {
  growth: Sprout, move: MoveRight, shield: ShieldCheck, house: Home, pension: PiggyBank, gift: Gift, kids: Baby, building: Building2,
  rocket: Rocket, coins: Coins, chart: ChartLine, leaf: Leaf, briefcase: Briefcase, calendar: CalendarDays, book: BookOpen,
  phone: Smartphone, globe: Globe2, percent: Percent, handshake: Handshake, umbrella: Umbrella,
} as const;

/** Original decorative illustration: an icon on layered circles with sparkles. */
export function Art({ kind, size = 260 }: { kind: ArtKind; size?: number }) {
  const I = ICON[kind];
  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden>
      <div className="absolute inset-0 rounded-full bg-mint-strong" />
      <div className="absolute inset-[14%] rounded-full bg-surface/70" />
      <div className="absolute -top-2 right-6 h-10 w-10 rounded-full bg-brand/15" />
      <div className="absolute bottom-4 -left-3 h-6 w-6 rounded-full bg-pos/30" />
      {[
        [8, 30],
        [86, 22],
        [80, 82],
      ].map(([x, y], i) => (
        <span key={i} className="absolute text-xl font-light text-brand/50" style={{ left: `${x}%`, top: `${y}%` }}>
          +
        </span>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <I className="text-pos" style={{ width: size * 0.36, height: size * 0.36 }} strokeWidth={1.4} />
      </div>
    </div>
  );
}

export function SmallIcon({ name }: { name?: string }) {
  const I = (name && ICON[name as ArtKind]) || Sprout;
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-pos">
      <I className="h-5 w-5" />
    </span>
  );
}
