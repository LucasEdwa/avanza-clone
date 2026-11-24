import YahooFinance from "yahoo-finance2";

const g = globalThis as unknown as { yf?: InstanceType<typeof YahooFinance> };
export const yf: InstanceType<typeof YahooFinance> =
  g.yf ?? new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"], validation: { logErrors: false } });
g.yf = yf;

/** yahoo-finance2 options to skip strict schema validation (Yahoo shapes drift). */
export const loose = { validateResult: false } as const;
