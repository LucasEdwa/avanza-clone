import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { db, schema, type Tx } from "@/db";
import type { Instrument, Order, Quote } from "@/db/schema";
import { calcCourtage, calcFxFee, FX_FEE_PCT, type CourtageClass } from "@/lib/courtage";
import { getFxRates, type FxRates } from "@/lib/market/fx";
import { fundExecutionTime, isMarketOpen, settlementDate, stockholmDate, venueForSymbol } from "@/lib/market-hours";
import { isOnTick } from "@/lib/ticks";
import { notify } from "@/lib/notify";
import { num, price as fmtPrice, sek } from "@/lib/format";
import { instrumentPath } from "@/lib/utils";

export class OrderError extends Error {}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

// ---------------- Buying power & availability ----------------

export async function reservedForAccount(accountId: string, tx: Tx | typeof db = db) {
  const [r] = await tx
    .select({ s: sql<string>`coalesce(sum(${schema.orders.reservedSek}),0)` })
    .from(schema.orders)
    .where(
      and(eq(schema.orders.accountId, accountId), eq(schema.orders.status, "ACTIVE"), eq(schema.orders.side, "BUY")),
    );
  return Number(r.s);
}

export async function buyingPower(accountId: string, tx: Tx | typeof db = db) {
  const [a] = await tx.select({ cash: schema.accounts.cash }).from(schema.accounts).where(eq(schema.accounts.id, accountId));
  if (!a) return 0;
  return round2(a.cash - (await reservedForAccount(accountId, tx)));
}

export async function availableQuantity(accountId: string, instrumentId: number, tx: Tx | typeof db = db) {
  const [h] = await tx
    .select({ q: schema.holdings.quantity })
    .from(schema.holdings)
    .where(and(eq(schema.holdings.accountId, accountId), eq(schema.holdings.instrumentId, instrumentId)));
  const [r] = await tx
    .select({ s: sql<string>`coalesce(sum(${schema.orders.quantity}),0)` })
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.accountId, accountId),
        eq(schema.orders.instrumentId, instrumentId),
        eq(schema.orders.status, "ACTIVE"),
        eq(schema.orders.side, "SELL"),
      ),
    );
  return round6((h?.q ?? 0) - Number(r.s));
}

// ---------------- Place / cancel ----------------

export type PlaceOrderInput = {
  userId: string;
  accountId: string;
  instrumentId: number;
  side: "BUY" | "SELL";
  type: "LIMIT" | "STOP_LOSS" | "FUND";
  quantity?: number;
  limitPrice?: number;
  triggerPrice?: number;
  amount?: number; // fund buy (SEK)
  validUntil?: string; // YYYY-MM-DD
  source?: "manual" | "monthly";
};

export function estimateBuyReservation(opts: {
  quantity: number;
  limitPrice: number;
  fx: number;
  currency: string;
  courtageClass: CourtageClass;
  tradedVolumeSek: number;
}) {
  const valueSek = opts.quantity * opts.limitPrice * opts.fx;
  const courtage = calcCourtage(opts.courtageClass, valueSek, opts.tradedVolumeSek);
  const fxFee = calcFxFee(valueSek, opts.currency);
  return { valueSek: round2(valueSek), courtage, fxFee, total: round2(valueSek + courtage + fxFee) };
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const today = stockholmDate();
  const order = await db.transaction(async (tx) => {
    const [user] = await tx.select().from(schema.users).where(eq(schema.users.id, input.userId));
    const [account] = await tx
      .select()
      .from(schema.accounts)
      .where(and(eq(schema.accounts.id, input.accountId), eq(schema.accounts.userId, input.userId)))
      .for("update");
    if (!user || !account || account.closedAt) throw new OrderError("Kontot hittades inte.");
    if (account.type === "SPARKONTO") throw new OrderError("Det går inte att handla värdepapper på ett sparkonto.");

    const [inst] = await tx.select().from(schema.instruments).where(eq(schema.instruments.id, input.instrumentId));
    if (!inst || !inst.tradable || !["STOCK", "ETF", "FUND"].includes(inst.type))
      throw new OrderError("Instrumentet är inte handelsbart.");
    const [quote] = await tx.select().from(schema.quotes).where(eq(schema.quotes.instrumentId, inst.id));
    const fxRates = await getFxRates();
    const fx = fxRates[inst.currency];
    if (!fx) throw new OrderError(`Saknar valutakurs för ${inst.currency}.`);

    const validUntil = input.validUntil ?? today;
    if (validUntil < today) throw new OrderError("Giltighetsdatum kan inte ligga bakåt i tiden.");
    const maxDate = new Date(Date.now() + 31 * 86400_000).toISOString().slice(0, 10);
    if (validUntil > maxDate) throw new OrderError("En order kan som längst vara giltig i 30 dagar.");

    const base = {
      userId: user.id,
      accountId: account.id,
      instrumentId: inst.id,
      side: input.side,
      validUntil,
      source: input.source ?? "manual",
    } as const;

    // ---------- Fund orders ----------
    if (inst.type === "FUND") {
      const executeAfter = fundExecutionTime();
      if (input.side === "BUY") {
        const amount = round2(input.amount ?? 0);
        const min = inst.minInvestment ?? 100;
        if (!(amount >= min)) throw new OrderError(`Lägsta köpbelopp är ${sek(min, 0)}.`);
        const bp = round2(account.cash - (await reservedForAccount(account.id, tx)));
        if (amount > bp) throw new OrderError(`Otillräcklig köpkraft. Tillgängligt: ${sek(bp)}.`);
        const [o] = await tx
          .insert(schema.orders)
          .values({ ...base, type: "FUND", amount, reservedSek: amount, executeAfter, validUntil: executeAfter.toISOString().slice(0, 10) })
          .returning();
        return o;
      }
      const qty = round6(input.quantity ?? 0);
      if (!(qty > 0)) throw new OrderError("Ange antal andelar att sälja.");
      const avail = await availableQuantity(account.id, inst.id, tx);
      if (qty > avail + 1e-6) throw new OrderError(`Du kan som mest sälja ${num(avail, 0, 4)} andelar.`);
      const [o] = await tx
        .insert(schema.orders)
        .values({ ...base, type: "FUND", quantity: Math.min(qty, avail), executeAfter, validUntil: executeAfter.toISOString().slice(0, 10) })
        .returning();
      return o;
    }

    // ---------- Stocks / ETFs ----------
    const qty = input.quantity ?? 0;
    if (!Number.isInteger(qty) || qty <= 0) throw new OrderError("Antal måste vara ett positivt heltal.");
    const limit = input.limitPrice ?? 0;
    if (!(limit > 0)) throw new OrderError("Ange ett giltigt pris.");
    if (!isOnTick(limit, inst.currency)) throw new OrderError("Priset följer inte instrumentets prissteg (tick size).");
    const ref = quote?.last ?? limit;
    if (Math.abs(limit / ref - 1) > 0.5)
      throw new OrderError(`Priset avviker mer än 50 % från senaste kurs (${fmtPrice(ref)}).`);
    let triggerPrice: number | null = null;
    if (input.type === "STOP_LOSS") {
      triggerPrice = input.triggerPrice ?? 0;
      if (!(triggerPrice > 0)) throw new OrderError("Ange en aktiveringskurs för stop loss.");
    }

    let reservedSek = 0;
    if (input.side === "BUY") {
      const est = estimateBuyReservation({
        quantity: qty,
        limitPrice: limit,
        fx: fx * (inst.currency === "SEK" ? 1 : 1 + 0.01), // 1 % FX buffer like brokers reserve
        currency: inst.currency,
        courtageClass: user.courtageClass,
        tradedVolumeSek: user.tradedVolumeSek,
      });
      reservedSek = est.total;
      const bp = round2(account.cash - (await reservedForAccount(account.id, tx)));
      if (reservedSek > bp) throw new OrderError(`Otillräcklig köpkraft. Ordern kräver ${sek(reservedSek)}, tillgängligt ${sek(bp)}.`);
    } else {
      const avail = await availableQuantity(account.id, inst.id, tx);
      if (qty > avail) throw new OrderError(`Du kan som mest sälja ${num(avail, 0)} st.`);
    }

    const [o] = await tx
      .insert(schema.orders)
      .values({
        ...base,
        type: input.type === "STOP_LOSS" ? "STOP_LOSS" : "LIMIT",
        quantity: qty,
        limitPrice: limit,
        triggerPrice,
        reservedSek,
      })
      .returning();
    return o;
  });

  // Try to match immediately
  await matchOrders({ orderIds: [order.id] });
  const [fresh] = await db.select().from(schema.orders).where(eq(schema.orders.id, order.id));
  return fresh;
}

export async function cancelOrder(userId: string, orderId: string, reason = "Makulerad av kund") {
  const [o] = await db
    .update(schema.orders)
    .set({ status: "CANCELLED", statusReason: reason, reservedSek: 0, updatedAt: new Date() })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId), eq(schema.orders.status, "ACTIVE")))
    .returning();
  if (!o) throw new OrderError("Ordern kunde inte makuleras (den kan redan vara utförd).");
  return o;
}

export async function modifyOrder(
  userId: string,
  orderId: string,
  changes: { quantity?: number; limitPrice?: number; validUntil?: string; triggerPrice?: number },
) {
  const [old] = await db
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId)));
  if (!old || old.status !== "ACTIVE") throw new OrderError("Ordern kan inte ändras.");
  if (old.type === "FUND") throw new OrderError("Fondordrar kan inte ändras, makulera och lägg en ny.");
  await cancelOrder(userId, orderId, "Ändrad av kund");
  try {
    return await placeOrder({
      userId,
      accountId: old.accountId,
      instrumentId: old.instrumentId,
      side: old.side,
      type: old.type,
      quantity: changes.quantity ?? old.quantity ?? undefined,
      limitPrice: changes.limitPrice ?? old.limitPrice ?? undefined,
      triggerPrice: changes.triggerPrice ?? old.triggerPrice ?? undefined,
      validUntil: changes.validUntil ?? old.validUntil,
    });
  } catch (e) {
    // restore the original order
    await db
      .update(schema.orders)
      .set({ status: "ACTIVE", statusReason: null, reservedSek: old.reservedSek })
      .where(eq(schema.orders.id, orderId));
    throw e;
  }
}

// ---------------- Matching ----------------

type FillCtx = { order: Order; inst: Instrument; price: number; fx: number };

async function fillOrder(ctx: FillCtx) {
  const { inst, price, fx } = ctx;
  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(schema.orders).where(eq(schema.orders.id, ctx.order.id)).for("update");
    if (!order || order.status !== "ACTIVE") return;
    const [account] = await tx.select().from(schema.accounts).where(eq(schema.accounts.id, order.accountId)).for("update");
    const [user] = await tx.select().from(schema.users).where(eq(schema.users.id, order.userId));
    const [holding] = await tx
      .select()
      .from(schema.holdings)
      .where(and(eq(schema.holdings.accountId, account.id), eq(schema.holdings.instrumentId, inst.id)));

    const isFund = inst.type === "FUND";
    let qty = order.quantity ?? 0;
    if (isFund && order.side === "BUY") qty = round6((order.amount ?? 0) / (price * fx));
    const valueSek = round2(qty * price * fx);
    const courtage = isFund ? 0 : calcCourtage(user.courtageClass, valueSek, user.tradedVolumeSek);
    const fxFee = isFund ? 0 : calcFxFee(valueSek, inst.currency);
    const tradeDate = stockholmDate();
    const settle = settlementDate(tradeDate);

    if (order.side === "BUY") {
      const total = isFund ? round2(order.amount ?? valueSek) : round2(valueSek + courtage + fxFee);
      if (total > account.cash + 0.005) {
        await tx
          .update(schema.orders)
          .set({ status: "REJECTED", statusReason: "Otillräckligt saldo vid avslut", reservedSek: 0, updatedAt: new Date() })
          .where(eq(schema.orders.id, order.id));
        return;
      }
      const oldQ = holding?.quantity ?? 0;
      const newQ = round6(oldQ + qty);
      const costLocal = isFund ? total / fx : qty * price + (courtage + fxFee) / fx;
      const avgPrice = (oldQ * (holding?.avgPrice ?? 0) + costLocal) / newQ;
      const avgPriceSek = (oldQ * (holding?.avgPriceSek ?? 0) + total) / newQ;
      await tx
        .update(schema.accounts)
        .set({ cash: sql`${schema.accounts.cash} - ${total}` })
        .where(eq(schema.accounts.id, account.id));
      await tx
        .insert(schema.holdings)
        .values({ accountId: account.id, instrumentId: inst.id, quantity: newQ, avgPrice, avgPriceSek })
        .onConflictDoUpdate({
          target: [schema.holdings.accountId, schema.holdings.instrumentId],
          set: { quantity: newQ, avgPrice, avgPriceSek, updatedAt: new Date() },
        });
      await tx.insert(schema.transactions).values({
        accountId: account.id,
        type: "BUY",
        instrumentId: inst.id,
        orderId: order.id,
        quantity: qty,
        price,
        currency: inst.currency,
        fxRate: fx,
        amount: -total,
        courtage,
        fxFee,
        description: `Köp ${inst.name}`,
        settleDate: settle,
      });
    } else {
      const held = holding?.quantity ?? 0;
      qty = Math.min(qty, held);
      if (qty <= 0) {
        await tx
          .update(schema.orders)
          .set({ status: "REJECTED", statusReason: "Innehav saknas", updatedAt: new Date() })
          .where(eq(schema.orders.id, order.id));
        return;
      }
      const gross = round2(qty * price * fx);
      const proceeds = round2(gross - courtage - fxFee);
      const realized = round2(proceeds - qty * (holding?.avgPriceSek ?? 0));
      const left = round6(held - qty);
      await tx
        .update(schema.accounts)
        .set({ cash: sql`${schema.accounts.cash} + ${proceeds}` })
        .where(eq(schema.accounts.id, account.id));
      if (left <= 1e-6)
        await tx
          .delete(schema.holdings)
          .where(and(eq(schema.holdings.accountId, account.id), eq(schema.holdings.instrumentId, inst.id)));
      else
        await tx
          .update(schema.holdings)
          .set({ quantity: left, updatedAt: new Date() })
          .where(and(eq(schema.holdings.accountId, account.id), eq(schema.holdings.instrumentId, inst.id)));
      await tx.insert(schema.transactions).values({
        accountId: account.id,
        type: "SELL",
        instrumentId: inst.id,
        orderId: order.id,
        quantity: qty,
        price,
        currency: inst.currency,
        fxRate: fx,
        amount: proceeds,
        courtage,
        fxFee,
        realizedGain: realized,
        description: `Sälj ${inst.name}`,
        settleDate: settle,
      });
    }

    await tx
      .update(schema.orders)
      .set({
        status: "FILLED",
        filledQuantity: qty,
        fillPrice: price,
        courtage: courtage + fxFee,
        fxRate: fx,
        reservedSek: 0,
        filledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, order.id));
    if (!isFund)
      await tx
        .update(schema.users)
        .set({ tradedVolumeSek: sql`${schema.users.tradedVolumeSek} + ${valueSek}` })
        .where(eq(schema.users.id, user.id));

    await notify(
      user.id,
      {
        kind: "order",
        title: `${order.side === "BUY" ? "Köp" : "Sälj"} utfört: ${inst.name}`,
        body: `${num(qty, 0, isFund ? 4 : 0)} ${isFund ? "andelar" : "st"} à ${fmtPrice(price)} ${inst.currency}${
          courtage ? ` · courtage ${sek(courtage)}` : ""
        }`,
        link: instrumentPath(inst),
      },
      tx,
    );
  });
}

let lastFullMatch = 0;

/**
 * Matches active orders against the latest cached quotes.
 * Called after every quote refresh, after placing an order, and from the background ticker.
 */
export async function matchOrders(filter?: { orderIds?: string[]; instrumentIds?: number[] }) {
  const conds = [eq(schema.orders.status, "ACTIVE")];
  if (filter?.orderIds?.length) conds.push(inArray(schema.orders.id, filter.orderIds));
  if (filter?.instrumentIds?.length) conds.push(inArray(schema.orders.instrumentId, filter.instrumentIds));
  if (!filter) lastFullMatch = Date.now();

  const active = await db.select().from(schema.orders).where(and(...conds));
  if (!active.length) return 0;

  const instIds = [...new Set(active.map((o) => o.instrumentId))];
  const insts = await db.select().from(schema.instruments).where(inArray(schema.instruments.id, instIds));
  const quotes = await db.select().from(schema.quotes).where(inArray(schema.quotes.instrumentId, instIds));
  const instById = new Map(insts.map((i) => [i.id, i]));
  const qById = new Map<number, Quote>(quotes.map((q) => [q.instrumentId, q]));
  let fx: FxRates | null = null;
  const today = stockholmDate();
  const now = new Date();
  let filled = 0;

  for (const o of active) {
    const inst = instById.get(o.instrumentId)!;
    const q = qById.get(o.instrumentId);

    // Expiry
    if (o.validUntil < today && inst.type !== "FUND") {
      await db
        .update(schema.orders)
        .set({ status: "EXPIRED", statusReason: "Giltighetstiden har löpt ut", reservedSek: 0, updatedAt: now })
        .where(eq(schema.orders.id, o.id));
      await notify(o.userId, {
        kind: "order",
        title: `Order har gått ut: ${inst.name}`,
        body: `${o.side === "BUY" ? "Köp" : "Sälj"} ${num(o.quantity ?? 0, 0)} st à ${fmtPrice(o.limitPrice)}`,
        link: "/min-ekonomi/ordrar",
      });
      continue;
    }
    if (!q?.last) continue;
    fx ??= await getFxRates();
    const rate = fx[inst.currency] ?? 1;

    if (inst.type === "FUND") {
      if (o.executeAfter && now >= o.executeAfter) {
        await fillOrder({ order: o, inst, price: q.last, fx: rate });
        filled++;
      }
      continue;
    }

    if (!isMarketOpen(venueForSymbol(inst.symbol), now)) continue;
    // Quote must be recent to trade on it
    if (now.getTime() - q.updatedAt.getTime() > 5 * 60_000) continue;

    let order = o;
    if (o.type === "STOP_LOSS" && !o.triggered) {
      const hit = o.side === "SELL" ? q.last <= (o.triggerPrice ?? 0) : q.last >= (o.triggerPrice ?? Infinity);
      if (!hit) continue;
      await db.update(schema.orders).set({ triggered: true, updatedAt: now }).where(eq(schema.orders.id, o.id));
      order = { ...o, triggered: true };
    }

    const limit = order.limitPrice ?? 0;
    if (order.side === "BUY") {
      const ask = q.ask ?? q.last;
      if (ask <= limit) {
        await fillOrder({ order, inst, price: Math.min(ask, limit), fx: rate });
        filled++;
      }
    } else {
      const bid = q.bid ?? q.last;
      if (bid >= limit) {
        await fillOrder({ order, inst, price: Math.max(bid, limit), fx: rate });
        filled++;
      }
    }
  }
  return filled;
}

// ---------------- Price alerts ----------------

export async function checkAlerts(instrumentIds: number[]) {
  if (!instrumentIds.length) return;
  const alerts = await db
    .select({ a: schema.priceAlerts, q: schema.quotes, i: schema.instruments })
    .from(schema.priceAlerts)
    .innerJoin(schema.quotes, eq(schema.quotes.instrumentId, schema.priceAlerts.instrumentId))
    .innerJoin(schema.instruments, eq(schema.instruments.id, schema.priceAlerts.instrumentId))
    .where(and(eq(schema.priceAlerts.active, true), inArray(schema.priceAlerts.instrumentId, instrumentIds)));
  for (const { a, q, i } of alerts) {
    if (q.last == null) continue;
    const hit = a.direction === "ABOVE" ? q.last >= a.price : q.last <= a.price;
    if (!hit) continue;
    const [upd] = await db
      .update(schema.priceAlerts)
      .set({ active: false, triggeredAt: new Date() })
      .where(and(eq(schema.priceAlerts.id, a.id), eq(schema.priceAlerts.active, true)))
      .returning();
    if (upd)
      await notify(a.userId, {
        kind: "alert",
        title: `Kursvarning: ${i.name}`,
        body: `Kursen är nu ${fmtPrice(q.last)} ${i.currency} (${a.direction === "ABOVE" ? "över" : "under"} ${fmtPrice(a.price)}).`,
        link: instrumentPath(i),
      });
  }
}

// ---------------- Monthly savings ----------------

export async function runMonthlySavings(opts: { planId?: string; force?: boolean } = {}) {
  const today = stockholmDate();
  const day = Number(today.slice(8, 10));
  const month = today.slice(0, 7);
  const plans = await db
    .select()
    .from(schema.monthlySavings)
    .where(opts.planId ? eq(schema.monthlySavings.id, opts.planId) : eq(schema.monthlySavings.active, true));
  let ran = 0;
  for (const p of plans) {
    if (!opts.force) {
      if (!p.active || day < p.dayOfMonth) continue;
      if (p.lastRunOn && p.lastRunOn.slice(0, 7) === month) continue;
    }
    await db.transaction(async (tx) => {
      await tx
        .update(schema.accounts)
        .set({ cash: sql`${schema.accounts.cash} + ${p.amount}` })
        .where(eq(schema.accounts.id, p.accountId));
      await tx.insert(schema.transactions).values({
        accountId: p.accountId,
        type: "DEPOSIT",
        amount: p.amount,
        description: "Insättning månadssparande (autogiro)",
        settleDate: today,
      });
      await tx.update(schema.monthlySavings).set({ lastRunOn: today }).where(eq(schema.monthlySavings.id, p.id));
    });
    for (const a of p.allocations) {
      const amount = round2((p.amount * a.pct) / 100);
      if (amount <= 0) continue;
      try {
        await placeOrder({
          userId: p.userId,
          accountId: p.accountId,
          instrumentId: a.instrumentId,
          side: "BUY",
          type: "FUND",
          amount,
          source: "monthly",
        });
      } catch (e) {
        await notify(p.userId, { kind: "savings", title: "Månadssparande kunde inte genomföras", body: (e as Error).message });
      }
    }
    await notify(p.userId, {
      kind: "savings",
      title: "Månadssparande genomfört",
      body: `${sek(p.amount, 0)} har satts in och fondköp har lagts.`,
      link: "/min-ekonomi/manadsspara",
    });
    ran++;
  }
  return ran;
}

// ---------------- Savings account interest (credited monthly) ----------------

export async function creditInterest() {
  const month = stockholmDate().slice(0, 7);
  const savings = await db
    .select()
    .from(schema.accounts)
    .where(and(eq(schema.accounts.type, "SPARKONTO"), sql`${schema.accounts.closedAt} is null`));
  for (const a of savings) {
    if (!a.interestRate || a.cash <= 0) continue;
    if (a.createdAt.toISOString().slice(0, 7) === month) continue;
    const [done] = await db
      .select({ id: schema.transactions.id })
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.accountId, a.id),
          eq(schema.transactions.type, "INTEREST"),
          sql`to_char(${schema.transactions.bookedAt} at time zone 'Europe/Stockholm','YYYY-MM') = ${month}`,
        ),
      );
    if (done) continue;
    const interest = round2((a.cash * a.interestRate) / 100 / 12);
    if (interest <= 0) continue;
    await db.transaction(async (tx) => {
      await tx.update(schema.accounts).set({ cash: sql`${schema.accounts.cash} + ${interest}` }).where(eq(schema.accounts.id, a.id));
      await tx.insert(schema.transactions).values({
        accountId: a.id,
        type: "INTEREST",
        amount: interest,
        description: `Ränta ${(a.interestRate ?? 0).toLocaleString("sv-SE")} %`,
      });
    });
  }
}

// ---------------- Tick ----------------

export async function expireStaleBankId() {
  await db
    .update(schema.bankidOrders)
    .set({ status: "failed", hintCode: "expiredTransaction", completedAt: new Date() })
    .where(and(eq(schema.bankidOrders.status, "pending"), lt(schema.bankidOrders.createdAt, new Date(Date.now() - 180_000))));
}

export function timeSinceFullMatch() {
  return Date.now() - lastFullMatch;
}

export { FX_FEE_PCT };
