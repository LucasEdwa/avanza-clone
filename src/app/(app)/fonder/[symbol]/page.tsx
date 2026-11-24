import type { Metadata } from "next";
import { InstrumentView } from "@/components/instrument/instrument-view";
import { getInstrument } from "@/lib/instrument";

export async function generateMetadata({ params }: PageProps<"/fonder/[symbol]">): Promise<Metadata> {
  const { symbol } = await params;
  const i = await getInstrument(symbol);
  return { title: i ? `${i.name} (${i.ticker})` : "Instrument" };
}

export default async function Page({ params }: PageProps<"/fonder/[symbol]">) {
  const { symbol } = await params;
  return <InstrumentView symbol={symbol} expected="FUND" />;
}
