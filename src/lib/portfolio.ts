import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Account, Instrument, Quote } from "@/db/schema";
import { getFxRates, FX_SYMBOLS } from "@/lib/market/fx";
import { liveQuotes } from "@/lib/market/live";
import { getDailyCloses } from "@/lib/market/data";

export type HoldingRow = {
  accountId: string;
  accountName: string;
  instrument: Instrument;
  quote: Quote | undefined;
  quantity: number;
  avgPrice: number;
  avgPriceSek: number;
  last: number | null;
  changePct: number | null;
  valueSek: number;
  costSek: number;
  todaySek: number;
  gainSek: number;
  gainPct: number;
};

export type AccountSummary = {
  account: Account;
  cash: number;
  reserved: number;
  buyingPower: number;
  holdingsValue: number;
  total: number;
  todaySek: number;
  todayPct: number;
  gainSek: number;
};

export async function getPortfolio(userId: string, accountId?: string) {
  const accounts = await db
    .select()
    .from(schema.accounts)
    .where(
      and(
        eq(schema.accounts.userId, userId),
        isNull(schema.accounts.closedAt),
        accountId ? eq(schema.accounts.id, accountId) : undefined,
      ),
    )
    .orderBy(asc(schema.accounts.createdAt));
  const accIds = accounts.map((a) => a.id);
  const rows = accIds.length
    ? await db
        .select({ h: schema.holdings, i: schema.instruments })
        .from(schema.holdings)
        .innerJoin(schema.instruments, eq(schema.instruments.id, schema.holdings.instrumentId))
        .where(inArray(schema.holdings.accountId, accIds))
    : [];
  const reservedRows = accIds.length
    ? await db
        .select({ accountId: schema.orders.accountId, s: sql<string>`sum(${schema.orders.reservedSek})` })
        .from(schema.orders)
        .where(and(inArray(schema.orders.accountId, accIds), eq(schema.orders.status, "ACTIVE")))
        .groupBy(schema.orders.accountId)
    : [];
  const reserved = new Map(reservedRows.map((r) => [r.accountId, Number(r.s)]));

  const instMap = new Map(rows.map((r) => [r.i.id, r.i]));
  const quotes = await liveQuotes([...instMap.values()]);
  const fx = await getFxRates();

  const holdings: HoldingRow[] = rows.map(({ h, i }) => {
    const q = quotes.get(i.id);
    const rate = fx[i.currency] ?? 1;
    const last = q?.last ?? null;
    const valueSek = (last ?? h.avgPrice) * h.quantity * rate;
    const costSek = h.avgPriceSek * h.quantity;
    const todaySek = q?.change != null ? q.change * h.quantity * rate : 0;
    return {
      accountId: h.accountId,
      accountName: accounts.find((a) => a.id === h.accountId)!.name,
      instrument: i,
      quote: q,
      quantity: h.quantity,
      avgPrice: h.avgPrice,
      avgPriceSek: h.avgPriceSek,
      last,
      changePct: q?.changePct ?? null,
      valueSek,
      costSek,
      todaySek,
      gainSek: valueSek - costSek,
      gainPct: costSek > 0 ? ((valueSek - costSek) / costSek) * 100 : 0,
    };
  });
  holdings.sort((a, b) => b.valueSek - a.valueSek);

  const summaries: AccountSummary[] = accounts.map((a) => {
    const hs = holdings.filter((h) => h.accountId === a.id);
    const holdingsValue = hs.reduce((s, h) => s + h.valueSek, 0);
    const todaySek = hs.reduce((s, h) => s + h.todaySek, 0);
    const res = reserved.get(a.id) ?? 0;
    const total = a.cash + holdingsValue;
    return {
      account: a,
      cash: a.cash,
      reserved: res,
      buyingPower: Math.round((a.cash - res) * 100) / 100,
      holdingsValue,
      total,
      todaySek,
      todayPct: total - todaySek > 0 ? (todaySek / (total - todaySek)) * 100 : 0,
      gainSek: hs.reduce((s, h) => s + h.gainSek, 0),
    };
  });

  const total = summaries.reduce((s, a) => s + a.total, 0);
  const todaySek = summaries.reduce((s, a) => s + a.todaySek, 0);
  return {
    accounts: summaries,
    holdings,
    fx,
    totals: {
      total,
      cash: summaries.reduce((s, a) => s + a.cash, 0),
      buyingPower: summaries.reduce((s, a) => s + a.buyingPower, 0),
      holdingsValue: summaries.reduce((s, a) => s + a.holdingsValue, 0),
      todaySek,
      todayPct: total - todaySek > 0 ? (todaySek / (total - todaySek)) * 100 : 0,
      gainSek: holdings.reduce((s, h) => s + h.gainSek, 0),
    },
  };
}

export type HistoryPoint = { t: number; value: number; dev: number };

const EXTERNAL_FLOW = new Set(["DEPOSIT", "WITHDRAWAL", "TRANSFER_IN", "TRANSFER_OUT"]);

/**
 * Rebuilds daily portfolio value from the transaction log and real historical closes,
 * plus time-weighted development (deposits/withdrawals excluded).
 */
export async function getHistory(userId: string, accountIds?: string[]): Promise<HistoryPoint[]> {
  const accs = await db
    .select({ id: schema.accounts.id })
    .from(schema.accounts)
    .where(eq(schema.accounts.userId, userId));
  const ids = accountIds?.length ? accountIds.filter((id) => accs.some((a) => a.id === id)) : accs.map((a) => a.id);
  if (!ids.length) return [];
  const txs = await db
    .select({ t: schema.transactions, i: schema.instruments })
    .from(schema.transactions)
    .leftJoin(schema.instruments, eq(schema.instruments.id, schema.transactions.instrumentId))
    .where(inArray(schema.transactions.accountId, ids))
    .orderBy(asc(schema.transactions.bookedAt));
  if (!txs.length) return [];

  const DAY = 86400_000;
  const start = new Date(txs[0].t.bookedAt.toISOString().slice(0, 10) + "T00:00:00Z");
  const insts = new Map<number, Instrument>();
  for (const { i } of txs) if (i) insts.set(i.id, i);

  const closes = new Map<number, Record<string, number>>();
  await Promise.all(
    [...insts.values()].map(async (i) => closes.set(i.id, await getDailyCloses(i.symbol, start))),
  );
  const fxCloses = new Map<string, Record<string, number>>();
  const currencies = new Set([...insts.values()].map((i) => i.currency).filter((c) => c !== "SEK"));
  await Promise.all(
    [...currencies].map(async (c) => FX_SYMBOLS[c] && fxCloses.set(c, await getDailyCloses(FX_SYMBOLS[c], start))),
  );
  // Current prices for "today"
  const live = await liveQuotes([...insts.values()]);
  const fxNow = await getFxRates();

  const qty = new Map<number, number>();
  const lastPx = new Map<number, number>();
  const lastFx = new Map<string, number>();
  let cash = 0;
  let ti = 0;
  const out: HistoryPoint[] = [];
  let prevValue = 0;
  let index = 1;
  const today = new Date().toISOString().slice(0, 10);

  for (let d = start.getTime(); ; d += DAY) {
    const day = new Date(d).toISOString().slice(0, 10);
    if (day > today) break;
    let flow = 0;
    while (ti < txs.length && txs[ti].t.bookedAt.toISOString().slice(0, 10) <= day) {
      const { t } = txs[ti++];
      cash += t.amount;
      if (EXTERNAL_FLOW.has(t.type)) flow += t.amount;
      if (t.instrumentId && t.quantity) {
        const sign = t.type === "BUY" ? 1 : t.type === "SELL" ? -1 : 0;
        qty.set(t.instrumentId, (qty.get(t.instrumentId) ?? 0) + sign * t.quantity);
        if (t.price && !lastPx.has(t.instrumentId)) lastPx.set(t.instrumentId, t.price);
      }
    }
    let value = cash;
    for (const [id, q] of qty) {
      if (Math.abs(q) < 1e-9) continue;
      const inst = insts.get(id)!;
      let px = closes.get(id)?.[day];
      if (day === today) px = live.get(id)?.last ?? px;
      if (px != null) lastPx.set(id, px);
      let rate = 1;
      if (inst.currency !== "SEK") {
        let r = fxCloses.get(inst.currency)?.[day];
        if (day === today) r = fxNow[inst.currency] ?? r;
        if (r != null) lastFx.set(inst.currency, r);
        rate = lastFx.get(inst.currency) ?? fxNow[inst.currency] ?? 1;
      }
      value += q * (lastPx.get(id) ?? 0) * rate;
    }
    if (prevValue > 0) {
      const r = (value - flow) / prevValue;
      if (Number.isFinite(r) && r > 0) index *= r;
    }
    prevValue = value;
    const wd = new Date(d).getUTCDay();
    if (wd !== 0 && wd !== 6) out.push({ t: Math.floor(d / 1000), value, dev: (index - 1) * 100 });
  }
  return out;
}
