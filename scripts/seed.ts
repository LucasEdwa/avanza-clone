import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "../src/db";
import { yf, loose } from "../src/lib/market/yahoo";
import { fetchYahooQuotes, mapYahooQuote } from "../src/lib/market/quotes";
import { getDailyCloses } from "../src/lib/market/data";
import { makePersonnummer } from "../src/lib/personnummer";
import { calcCourtage, calcFxFee } from "../src/lib/courtage";
import { addTradingDays } from "../src/lib/market-hours";
import { STOCKS, ETFS, INDICES, FUNDS } from "./catalog";

/* eslint-disable @typescript-eslint/no-explicit-any */

function ticker(symbol: string) {
  if (symbol.startsWith("0P")) return symbol.replace(".ST", "");
  return symbol.replace(/\.(ST|CO|OL|DE|HE)$/, "").replace(/-/g, " ").replace(/ SDB$/, " SDB");
}
function country(symbol: string) {
  if (symbol.endsWith(".ST")) return "SE";
  if (symbol.endsWith(".CO")) return "DK";
  if (symbol.endsWith(".OL")) return "NO";
  if (symbol.endsWith(".DE")) return "DE";
  return "US";
}
function segment(symbol: string, cap: number | null) {
  const c = country(symbol);
  if (c === "US") return "USA";
  if (c === "DK") return "Danmark";
  if (c === "NO") return "Norge";
  if (!cap) return "Small Cap";
  if (cap >= 11.5e9) return "Large Cap";
  if (cap >= 1.7e9) return "Mid Cap";
  return "Small Cap";
}
const SECTOR_SV: Record<string, string> = {
  Industrials: "Industri",
  Technology: "Teknik",
  "Financial Services": "Finans",
  Healthcare: "Hälsovård",
  "Consumer Cyclical": "Sällanköpsvaror",
  "Consumer Defensive": "Dagligvaror",
  "Basic Materials": "Råvaror",
  "Real Estate": "Fastigheter",
  "Communication Services": "Telekom & media",
  Energy: "Energi",
  Utilities: "Kraftförsörjning",
};

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>) {
  const out: R[] = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

async function seedInstruments() {
  console.log("Fetching quotes for catalog…");
  const all = [...STOCKS, ...ETFS, ...INDICES.map((x) => x[0]), ...FUNDS.map((f) => f[0])];
  const quotes = await fetchYahooQuotes(all);
  const qBy = new Map(quotes.map((q) => [q.symbol, q as any]));

  console.log("Fetching company profiles (sector/industry)…");
  const profiles = new Map<string, any>();
  await pool(STOCKS, 6, async (s) => {
    try {
      const r: any = await yf.quoteSummary(s, { modules: ["assetProfile"] }, loose);
      profiles.set(s, r.assetProfile ?? {});
    } catch {
      /* ignore */
    }
  });
  const fees = new Map<string, number>();
  await pool(
    FUNDS.map((f) => f[0]),
    4,
    async (s) => {
      try {
        const r: any = await yf.quoteSummary(s, { modules: ["fundProfile"] }, loose);
        const v = r.fundProfile?.feesExpensesInvestment?.annualReportExpenseRatio;
        const n = typeof v === "number" ? v : v?.raw;
        if (typeof n === "number" && n > 0) fees.set(s, n < 0.1 ? n * 100 : n);
      } catch {
        /* ignore */
      }
    },
  );

  const rows: (typeof schema.instruments.$inferInsert)[] = [];
  for (const s of STOCKS) {
    const q = qBy.get(s);
    if (!q) {
      console.warn("skip (no quote)", s);
      continue;
    }
    const p = profiles.get(s) ?? {};
    rows.push({
      symbol: s,
      ticker: ticker(s),
      name: q.longName ?? q.shortName ?? s,
      type: "STOCK",
      currency: q.currency ?? "SEK",
      exchange: q.fullExchangeName ?? q.exchange,
      country: country(s),
      segment: segment(s, q.marketCap ?? null),
      sector: p.sector ? (SECTOR_SV[p.sector] ?? p.sector) : null,
      industry: p.industry ?? null,
    });
  }
  for (const s of ETFS) {
    const q = qBy.get(s);
    if (!q) continue;
    rows.push({
      symbol: s,
      ticker: ticker(s),
      name: q.longName ?? q.shortName ?? s,
      type: "ETF",
      currency: q.currency ?? "SEK",
      exchange: q.fullExchangeName ?? q.exchange,
      country: country(s),
      segment: "ETF",
    });
  }
  for (const [s, name, type, t] of INDICES) {
    const q = qBy.get(s);
    rows.push({ symbol: s, ticker: t, name, type, currency: q?.currency ?? "SEK", tradable: false, exchange: q?.fullExchangeName });
  }
  for (const [s, category, risk, fee, company] of FUNDS) {
    const q = qBy.get(s);
    if (!q) continue;
    rows.push({
      symbol: s,
      ticker: ticker(s),
      name: q.longName ?? q.shortName ?? s,
      type: "FUND",
      currency: q.currency ?? "SEK",
      country: "SE",
      fundCategory: category,
      fundRisk: risk,
      fundFee: fees.get(s) ?? fee,
      fundCompany: company,
      minInvestment: 100,
    });
  }
  await db
    .insert(schema.instruments)
    .values(rows)
    .onConflictDoUpdate({
      target: schema.instruments.symbol,
      set: {
        name: sql`excluded.name`,
        segment: sql`excluded.segment`,
        sector: sql`excluded.sector`,
        industry: sql`excluded.industry`,
        fundFee: sql`excluded.fund_fee`,
      },
    });
  const insts = await db.select().from(schema.instruments);
  const qrows = insts
    .map((i) => {
      const q = qBy.get(i.symbol);
      return q ? { instrumentId: i.id, ...mapYahooQuote(q), updatedAt: new Date() } : null;
    })
    .filter((r): r is NonNullable<typeof r> => !!r && r.last != null);
  for (const r of qrows)
    await db.insert(schema.quotes).values(r).onConflictDoUpdate({ target: schema.quotes.instrumentId, set: r });
  console.log(`Instruments: ${insts.length}, quotes: ${qrows.length}`);
  return insts;
}

// ---------------- Demo customer ----------------

type Inst = typeof schema.instruments.$inferSelect;

async function seedDemoUser(insts: Inst[]) {
  const pnr = makePersonnummer("19900315", "238");
  await db.delete(schema.users).where(eq(schema.users.personalNumber, pnr));
  const [user] = await db
    .insert(schema.users)
    .values({
      personalNumber: pnr,
      firstName: "Anna",
      lastName: "Lindqvist",
      email: "anna.lindqvist@example.se",
      phone: "070-123 45 67",
      street: "Storgatan 12",
      postalCode: "11455",
      city: "Stockholm",
      courtageClass: "MINI",
      termsSignedAt: new Date(Date.now() - 800 * 86400_000),
      kycCompletedAt: new Date(Date.now() - 800 * 86400_000),
      kyc: {
        occupation: "Anställd",
        income: "40 000–60 000 kr/mån",
        origin: "Lön",
        purpose: ["Långsiktigt sparande", "Pension"],
        deposits: "Under 100 000 kr/år",
        pep: "Nej",
        usPerson: "Nej",
        taxCountry: "Sverige",
      },
      createdAt: new Date(Date.now() - 800 * 86400_000),
    })
    .returning();
  console.log(`Demo customer: Anna Lindqvist ${pnr.slice(0, 8)}-${pnr.slice(8)}`);

  const [bank] = await db
    .insert(schema.bankAccounts)
    .values({ userId: user.id, bankName: "Handelsbanken", clearing: "6789", accountNumber: "123456789" })
    .returning();

  const mk = async (type: "ISK" | "KF" | "AF" | "SPARKONTO", name: string, daysAgo: number, rate?: number) => {
    const [a] = await db
      .insert(schema.accounts)
      .values({
        userId: user.id,
        type,
        name,
        accountNumber: String(Math.floor(1000000 + Math.random() * 8999999)),
        interestRate: rate ?? null,
        createdAt: new Date(Date.now() - daysAgo * 86400_000),
      })
      .returning();
    return a;
  };
  const isk = await mk("ISK", "ISK", 760);
  const af = await mk("AF", "Aktie- & fondkonto", 400);
  const kf = await mk("KF", "Kapitalförsäkring", 300);
  const spar = await mk("SPARKONTO", "Sparkonto", 500, 2.25);

  const by = (s: string) => insts.find((i) => i.symbol === s)!;
  const fxSym: Record<string, string> = { USD: "USDSEK=X", EUR: "EURSEK=X" };

  const today = new Date().toISOString().slice(0, 10);
  const dayAgo = (n: number) => {
    const d = new Date(Date.now() - n * 86400_000).toISOString().slice(0, 10);
    return addTradingDays(d, 1); // next trading day
  };
  const at = (d: string, h = 10) => new Date(`${d}T${String(h).padStart(2, "0")}:15:00+01:00`);

  async function closeOn(symbol: string, day: string) {
    const c = await getDailyCloses(symbol, new Date(Date.now() - 800 * 86400_000));
    const days = Object.keys(c).sort();
    const d = days.find((x) => x >= day) ?? days[days.length - 1];
    return c[d];
  }

  type Pos = { q: number; avg: number; avgSek: number };
  const pos = new Map<string, Map<number, Pos>>();
  const cash = new Map<string, number>();

  async function deposit(accId: string, day: string, amount: number) {
    cash.set(accId, (cash.get(accId) ?? 0) + amount);
    await db.insert(schema.transactions).values({
      accountId: accId,
      type: "DEPOSIT",
      amount,
      description: "Insättning från Handelsbanken",
      bookedAt: at(day, 8),
      settleDate: day,
    });
  }

  async function trade(accId: string, day: string, symbol: string, side: "BUY" | "SELL", qtyOrAmount: number) {
    const inst = by(symbol);
    if (!inst) return;
    const px = await closeOn(symbol, day);
    const fx = inst.currency === "SEK" ? 1 : await closeOn(fxSym[inst.currency], day);
    if (!px || !fx) return;
    const isFund = inst.type === "FUND";
    const qty = isFund && side === "BUY" ? Math.round((qtyOrAmount / px) * 1e4) / 1e4 : qtyOrAmount;
    const valueSek = Math.round(qty * px * fx * 100) / 100;
    const courtage = isFund ? 0 : calcCourtage("MINI", valueSek);
    const fxFee = isFund ? 0 : calcFxFee(valueSek, inst.currency);
    const acc = pos.get(accId) ?? new Map<number, Pos>();
    pos.set(accId, acc);
    const p = acc.get(inst.id) ?? { q: 0, avg: 0, avgSek: 0 };
    let amount: number;
    let realized: number | null = null;
    if (side === "BUY") {
      amount = -(valueSek + courtage + fxFee);
      const nq = p.q + qty;
      p.avg = (p.q * p.avg + qty * px + (courtage + fxFee) / fx) / nq;
      p.avgSek = (p.q * p.avgSek - amount) / nq;
      p.q = nq;
    } else {
      amount = valueSek - courtage - fxFee;
      realized = Math.round((amount - qty * p.avgSek) * 100) / 100;
      p.q -= qty;
    }
    acc.set(inst.id, p);
    cash.set(accId, (cash.get(accId) ?? 0) + amount);
    const [order] = await db
      .insert(schema.orders)
      .values({
        userId: user.id,
        accountId: accId,
        instrumentId: inst.id,
        side,
        type: isFund ? "FUND" : "LIMIT",
        status: "FILLED",
        quantity: isFund && side === "BUY" ? null : qty,
        amount: isFund && side === "BUY" ? qtyOrAmount : null,
        limitPrice: isFund ? null : px,
        validUntil: day,
        filledQuantity: qty,
        fillPrice: px,
        courtage: courtage + fxFee,
        fxRate: fx,
        createdAt: at(day, 9),
        filledAt: at(day, 11),
      })
      .returning();
    await db.insert(schema.transactions).values({
      accountId: accId,
      type: side,
      instrumentId: inst.id,
      orderId: order.id,
      quantity: qty,
      price: px,
      currency: inst.currency,
      fxRate: fx,
      amount: Math.round(amount * 100) / 100,
      courtage,
      fxFee,
      realizedGain: realized,
      description: `${side === "BUY" ? "Köp" : "Sälj"} ${inst.name}`,
      bookedAt: at(day, 11),
      settleDate: addTradingDays(day, 2),
    });
  }

  console.log("Booking demo history at real historical prices…");
  const d0 = dayAgo(730);
  await deposit(isk.id, d0, 250_000);
  for (const [s, q] of [
    ["VOLV-B.ST", 200],
    ["INVE-B.ST", 150],
    ["ATCO-A.ST", 250],
    ["EVO.ST", 30],
    ["SAAB-B.ST", 120],
    ["HM-B.ST", 150],
    ["XACT-OMXS30.ST", 40],
  ] as const)
    await trade(isk.id, d0, s, "BUY", q);
  const d1 = dayAgo(520);
  await deposit(isk.id, d1, 60_000);
  await trade(isk.id, d1, "0P0001F3XT.ST", "BUY", 30_000);
  await trade(isk.id, d1, "0P00000L33.ST", "BUY", 20_000);
  const d2 = dayAgo(330);
  await trade(isk.id, d2, "VOLV-B.ST", "SELL", 80);
  await trade(isk.id, d2, "ERIC-B.ST", "BUY", 300);
  for (let m = 10; m >= 1; m--) {
    const d = dayAgo(m * 30);
    await deposit(isk.id, d, 2_000);
    await trade(isk.id, d, "0P0001F3XT.ST", "BUY", 1_000);
    await trade(isk.id, d, "0P00000L33.ST", "BUY", 1_000);
  }

  const a0 = dayAgo(395);
  await deposit(af.id, a0, 400_000);
  await trade(af.id, a0, "AAPL", "BUY", 40);
  await trade(af.id, a0, "NVDA", "BUY", 80);
  await trade(af.id, a0, "MSFT", "BUY", 25);
  const a1 = dayAgo(180);
  await trade(af.id, a1, "NVDA", "SELL", 30);
  await trade(af.id, a1, "SINCH.ST", "BUY", 1000);

  const k0 = dayAgo(295);
  await deposit(kf.id, k0, 50_000);
  await trade(kf.id, k0, "0P0000ULAP.ST", "BUY", 25_000);
  await trade(kf.id, k0, "0P00000LCG.ST", "BUY", 15_000);

  const s0 = dayAgo(495);
  await deposit(spar.id, s0, 75_000);

  // Write holdings & cash
  for (const [accId, m] of pos)
    for (const [instrumentId, p] of m)
      if (p.q > 1e-6)
        await db.insert(schema.holdings).values({ accountId: accId, instrumentId, quantity: p.q, avgPrice: p.avg, avgPriceSek: p.avgSek });
  for (const [accId, c] of cash)
    await db.update(schema.accounts).set({ cash: Math.round(c * 100) / 100 }).where(eq(schema.accounts.id, accId));
  void today;

  // Watchlists, alerts, monthly savings, notifications
  const [w1] = await db.insert(schema.watchlists).values({ userId: user.id, name: "Min bevakningslista" }).returning();
  const [w2] = await db.insert(schema.watchlists).values({ userId: user.id, name: "Försvar & tech" }).returning();
  for (const s of ["ERIC-B.ST", "SEB-A.ST", "NIBE-B.ST", "AZN.ST", "TSLA", "SPOT"])
    if (by(s)) await db.insert(schema.watchlistItems).values({ watchlistId: w1.id, instrumentId: by(s).id });
  for (const s of ["SAAB-B.ST", "MYCR.ST", "HEXA-B.ST", "NVDA"])
    if (by(s)) await db.insert(schema.watchlistItems).values({ watchlistId: w2.id, instrumentId: by(s).id });

  const [eq1] = await db.select().from(schema.quotes).where(eq(schema.quotes.instrumentId, by("ERIC-B.ST").id));
  if (eq1?.last)
    await db
      .insert(schema.priceAlerts)
      .values({ userId: user.id, instrumentId: by("ERIC-B.ST").id, direction: "ABOVE", price: Math.round(eq1.last * 1.05) });

  await db.insert(schema.monthlySavings).values({
    userId: user.id,
    accountId: isk.id,
    bankAccountId: bank.id,
    amount: 2000,
    dayOfMonth: 25,
    allocations: [
      { instrumentId: by("0P0001F3XT.ST").id, pct: 50 },
      { instrumentId: by("0P00000L33.ST").id, pct: 50 },
    ],
    lastRunOn: dayAgo(30),
  });
  await db.insert(schema.notifications).values({
    userId: user.id,
    kind: "info",
    title: "Välkommen till Spira",
    body: "Ditt konto är redo. Utforska marknaden eller starta ett månadssparande.",
    link: "/marknad",
  });
}

async function main() {
  const insts = await seedInstruments();
  if (!process.argv.includes("--instruments-only")) await seedDemoUser(insts);
  console.log("Seed complete.");
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
