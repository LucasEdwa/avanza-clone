"use client";

import { useEffect, useRef } from "react";
import { AreaSeries, ColorType, createChart, LineStyle, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export type ChartPoint = { t: number; v: number };

/** Area chart that follows the app theme (light/dark) and resizes with its container. */
export function useAreaChart(opts: {
  data: ChartPoint[];
  height: number;
  positive: boolean;
  intraday: boolean;
  baseline?: number | null;
  format: (v: number) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const { data, height, positive, intraday, baseline, format } = opts;

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      height,
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: cssVar("--muted"), fontFamily: "inherit", attributionLogo: false },
      grid: { vertLines: { visible: false }, horzLines: { color: cssVar("--border"), style: LineStyle.Dotted } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: intraday, secondsVisible: false, fixLeftEdge: true, fixRightEdge: true },
      crosshair: { horzLine: { labelBackgroundColor: cssVar("--fg") }, vertLine: { labelBackgroundColor: cssVar("--fg") } },
      localization: {
        locale: "sv-SE",
        priceFormatter: format,
        timeFormatter: (t: number) =>
          new Intl.DateTimeFormat("sv-SE", {
            timeZone: "Europe/Stockholm",
            ...(intraday ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" } : { year: "numeric", month: "short", day: "numeric" }),
          }).format(new Date(t * 1000)),
      },
      handleScroll: false,
      handleScale: false,
    });
    const series = chart.addSeries(AreaSeries, { lineWidth: 2, priceLineVisible: false, lastValueVisible: true });
    chartRef.current = chart;
    seriesRef.current = series;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height, intraday, format]);

  useEffect(() => {
    const s = seriesRef.current;
    if (!s) return;
    const color = cssVar(positive ? "--pos" : "--neg");
    s.applyOptions({ lineColor: color, topColor: color + "40", bottomColor: color + "00" });
    s.setData(data.map((p) => ({ time: p.t as UTCTimestamp, value: p.v })));
    s.priceLines().forEach((l) => s.removePriceLine(l));
    if (baseline != null)
      s.createPriceLine({ price: baseline, color: cssVar("--muted"), lineStyle: LineStyle.Dashed, lineWidth: 1, axisLabelVisible: false, title: "" });
    chartRef.current?.timeScale().fitContent();
  }, [data, positive, baseline]);

  return ref;
}
