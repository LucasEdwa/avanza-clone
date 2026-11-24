import type { Metadata } from "next";
import { InstrumentView } from "@/components/instrument/instrument-view";
import { getInstrument } from "@/lib/instrument";

export async function generateMetadata({ params }: PageProps<"/index/[symbol]">): Promise<Metadata> {
  const { symbol } = await params;
  const i = await getInstrument(symbol);
  return { title: i ? `${i.name} (${i.ticker})` : "Instrument" };
}

export default async function Page({ params, searchParams }: PageProps<"/index/[symbol]">) {
  const { symbol } = await params;
  const sida = (await searchParams).sida;
  return <InstrumentView side={sida === "salj" ? "SELL" : sida === "kop" ? "BUY" : undefined} symbol={symbol} expected="INDEX" />;
}
