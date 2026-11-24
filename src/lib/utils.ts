import { clsx, type ClassValue } from "clsx";
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  ISK: "Investeringssparkonto",
  KF: "Kapitalförsäkring",
  AF: "Aktie- & fondkonto",
  SPARKONTO: "Sparkonto",
};
export const ACCOUNT_TYPE_SHORT: Record<string, string> = {
  ISK: "ISK",
  KF: "KF",
  AF: "AF",
  SPARKONTO: "Sparkonto",
};

export const INSTRUMENT_TYPE_LABEL: Record<string, string> = {
  STOCK: "Aktie",
  FUND: "Fond",
  ETF: "Börshandlad fond",
  INDEX: "Index",
  CURRENCY: "Valuta",
  COMMODITY: "Råvara",
  CRYPTO: "Krypto",
};

export function instrumentPath(i: { type: string; symbol: string }): string {
  const s = encodeURIComponent(i.symbol);
  switch (i.type) {
    case "FUND":
      return `/fonder/${s}`;
    case "ETF":
      return `/borshandlade-fonder/${s}`;
    case "STOCK":
      return `/aktier/${s}`;
    default:
      return `/index/${s}`;
  }
}

export const TX_TYPE_LABEL: Record<string, string> = {
  BUY: "Köp",
  SELL: "Sälj",
  DEPOSIT: "Insättning",
  WITHDRAWAL: "Uttag",
  TRANSFER_IN: "Överföring in",
  TRANSFER_OUT: "Överföring ut",
  DIVIDEND: "Utdelning",
  INTEREST: "Ränta",
  TAX: "Skatt",
  FEE: "Avgift",
};
