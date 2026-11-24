import type { Widget } from "@/lib/site-nav";

export type ArtKind =
  | "growth" | "move" | "shield" | "house" | "pension" | "gift" | "kids" | "building" | "rocket"
  | "coins" | "chart" | "leaf" | "briefcase" | "calendar" | "book" | "phone" | "globe" | "percent" | "handshake" | "umbrella";

export type Block =
  | { type: "features"; title?: string; lead?: string; cols?: 2 | 3 | 4; items: { icon?: string; title: string; text: string; href?: string }[] }
  | { type: "split"; title: string; text: string; bullets?: string[]; art: ArtKind; reverse?: boolean; cta?: { label: string; href: string } }
  | { type: "steps"; title: string; lead?: string; items: { title: string; text: string }[] }
  | { type: "faq"; title?: string; items: { q: string; a: string }[] }
  | { type: "widget"; title?: string; lead?: string; widget: Widget }
  | { type: "table"; title: string; lead?: string; head: string[]; rows: string[][]; note?: string }
  | { type: "cards"; title: string; items: { title: string; text: string; href: string; tag?: string }[] }
  | { type: "band"; title: string; text: string; cta: { label: string; href: string } }
  | { type: "stats"; title?: string; items: { value: string; label: string }[] }
  | { type: "text"; title: string; paragraphs: string[] }
  | { type: "news"; title: string; items: { date: string; title: string; text: string; href?: string }[] }
  | { type: "notice"; text: string };

export type PageDef = {
  title: string;
  lead: string;
  art: ArtKind;
  cta?: { label: string; href: string };
  cta2?: { label: string; href: string };
  risk?: boolean;
  blocks: Block[];
};
