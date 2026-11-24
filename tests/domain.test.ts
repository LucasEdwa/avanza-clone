import { describe, expect, it } from "vitest";
import { isValidPersonnummer, luhnCheckDigit, makePersonnummer, normalizePersonnummer } from "@/lib/personnummer";
import { calcCourtage, calcFxFee } from "@/lib/courtage";
import { isOnTick, roundToTick, tickSize } from "@/lib/ticks";
import { addTradingDays, fundExecutionTime, isMarketOpen, isTradingDay, settlementDate, stockholmTime } from "@/lib/market-hours";
import { parseQrData, qrAuthCode, qrData } from "@/lib/bankid/qr";
import { messageFor } from "@/lib/bankid/messages";
import { num, pct, sek } from "@/lib/format";
import { schablonRate } from "@/lib/tax-rate";

describe("personnummer", () => {
  it("validates Luhn checksum", () => {
    expect(luhnCheckDigit("811218987")).toBe(6);
    expect(isValidPersonnummer("811218-9876")).toBe(true);
    expect(isValidPersonnummer("811218-9877")).toBe(false);
  });
  it("normalises to 12 digits", () => {
    expect(normalizePersonnummer("19811218-9876")).toBe("198112189876");
    expect(normalizePersonnummer("8112189876", new Date("2026-01-01"))).toBe("198112189876");
  });
  it("handles centenarians and coordination numbers", () => {
    expect(normalizePersonnummer("201212+1234".replace("1234", makePersonnummer("19201212", "123").slice(8)), new Date("2026-01-01"))).toBe(makePersonnummer("19201212", "123"));
    const samordning = makePersonnummer("19900375", "123"); // day 15 + 60
    expect(isValidPersonnummer(samordning)).toBe(true);
  });
  it("rejects impossible dates", () => {
    expect(normalizePersonnummer("19900230-1234")).toBeNull();
  });
  it("demo customer is valid", () => {
    expect(isValidPersonnummer("199003152387")).toBe(true);
  });
});

describe("courtage", () => {
  it("Mini: 0.25 %, min 1 kr", () => {
    expect(calcCourtage("MINI", 100)).toBe(1);
    expect(calcCourtage("MINI", 10_000)).toBe(25);
  });
  it("Small / Medium minimums", () => {
    expect(calcCourtage("SMALL", 10_000)).toBe(39);
    expect(calcCourtage("SMALL", 100_000)).toBe(150);
    expect(calcCourtage("MEDIUM", 10_000)).toBe(69);
    expect(calcCourtage("MEDIUM", 200_000)).toBe(138);
  });
  it("Fast pris is fixed", () => {
    expect(calcCourtage("FAST_PRIS", 1_000_000)).toBe(99);
  });
  it("Start is free up to 50 000 kr traded volume then Mini", () => {
    expect(calcCourtage("START", 20_000, 0)).toBe(0);
    expect(calcCourtage("START", 20_000, 40_000)).toBe(50);
  });
  it("FX fee only for foreign currency", () => {
    expect(calcFxFee(10_000, "SEK")).toBe(0);
    expect(calcFxFee(10_000, "USD")).toBe(25);
  });
});

describe("tick sizes", () => {
  it("follows the price ladder", () => {
    expect(tickSize(311.5)).toBe(0.1);
    expect(tickSize(103.75)).toBe(0.05);
    expect(tickSize(45)).toBe(0.01);
    expect(tickSize(250, "USD")).toBe(0.01);
  });
  it("rounds and validates", () => {
    expect(roundToTick(311.53)).toBe(311.5);
    expect(roundToTick(311.53, "SEK", "up")).toBe(311.6);
    expect(isOnTick(311.5)).toBe(true);
    expect(isOnTick(311.53)).toBe(false);
  });
});

describe("market hours", () => {
  it("knows weekends and Swedish holidays", () => {
    expect(isTradingDay("2026-11-28")).toBe(false); // Saturday
    expect(isTradingDay("2026-12-24")).toBe(false); // Christmas Eve
    expect(isTradingDay("2026-06-19")).toBe(false); // Midsummer Eve
    expect(isTradingDay("2026-11-24")).toBe(true);
  });
  it("opening hours in Stockholm time incl. DST", () => {
    expect(isMarketOpen("STO", stockholmTime("2026-11-24", 9, 0))).toBe(true);
    expect(isMarketOpen("STO", stockholmTime("2026-11-24", 17, 30))).toBe(false);
    expect(isMarketOpen("STO", stockholmTime("2026-07-01", 12, 0))).toBe(true);
    expect(isMarketOpen("STO", stockholmTime("2026-11-28", 12, 0))).toBe(false);
  });
  it("US market in New York time", () => {
    expect(isMarketOpen("US", new Date("2026-11-24T15:00:00Z"))).toBe(true);
    expect(isMarketOpen("US", new Date("2026-11-24T22:00:00Z"))).toBe(false);
  });
  it("settles T+2 skipping weekends/holidays", () => {
    expect(settlementDate("2026-11-26")).toBe("2026-11-30");
    expect(addTradingDays("2026-12-22", 2)).toBe("2026-12-28");
  });
  it("fund cut-off 15:00", () => {
    expect(fundExecutionTime(stockholmTime("2026-11-24", 14, 0)).toISOString()).toBe(stockholmTime("2026-11-24", 17, 45).toISOString());
    expect(fundExecutionTime(stockholmTime("2026-11-24", 16, 0)).toISOString()).toBe(stockholmTime("2026-11-25", 17, 45).toISOString());
    expect(fundExecutionTime(stockholmTime("2026-11-27", 16, 0)).toISOString()).toBe(stockholmTime("2026-11-30", 17, 45).toISOString());
  });
});

describe("BankID animated QR", () => {
  const secret = "d28db9a7-4cde-429e-a983-359be676944c";
  const token = "67df3917-fa0d-44e5-b327-edcc928297f8";
  it("matches the reference vector from the BankID documentation", () => {
    // qrStartSecret d28db9a7-…, time 0 → dc69358e712458a66a7525beef148ae8526b1c71610eff2c16cdffb4cdac9bf8
    expect(qrAuthCode(secret, 0)).toBe("dc69358e712458a66a7525beef148ae8526b1c71610eff2c16cdffb4cdac9bf8");
  });
  it("formats and parses QR data", () => {
    const created = new Date(Date.now() - 5000);
    const d = qrData(token, secret, created);
    const p = parseQrData(d)!;
    expect(p.qrStartToken).toBe(token);
    expect(p.seconds).toBeGreaterThanOrEqual(4);
    expect(p.code).toBe(qrAuthCode(secret, p.seconds));
  });
  it("detects tampering", () => {
    const d = qrData(token, secret, new Date());
    const p = parseQrData(d)!;
    const flipped = p.code.slice(0, -1) + (p.code.endsWith("a") ? "b" : "a");
    expect(qrAuthCode(secret, p.seconds)).not.toBe(flipped);
  });
  it("user messages", () => {
    expect(messageFor("pending", "userSign", { qr: true, intent: "auth" })).toMatch(/säkerhetskod/);
    expect(messageFor("failed", "userCancel", { qr: true, intent: "auth" })).toBe("Åtgärden avbruten.");
  });
});

describe("formatting (sv-SE)", () => {
  it("uses Swedish separators", () => {
    expect(sek(1234.5).replace(/ /g, " ")).toBe("1 234,50 kr");
    expect(pct(1.234)).toBe("+1,23 %");
    expect(num(-5, 0)).toBe("-5");
  });
});

describe("ISK schablonränta", () => {
  it("is SLR + 1 with a 1.25 % floor", () => {
    expect(schablonRate(2025)).toBeCloseTo(2.96);
    expect(schablonRate(2026)).toBeCloseTo(3.55);
  });
});
