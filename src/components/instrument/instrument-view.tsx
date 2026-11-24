import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db, schema } from "@/db";
import { getUser } from "@/lib/auth";
import { defaultValidity, getInstrument, myPositions, ownersCount } from "@/lib/instrument";
import { liveQuotes } from "@/lib/market/live";
import { getChart, getNews, getProfile } from "@/lib/market/data";
import { getFxRates } from "@/lib/market/fx";
import { availableQuantity, buyingPower } from "@/lib/trading/engine";
import { isMarketOpen, venueForSymbol } from "@/lib/market-hours";
import { compact, dateSv, num, pct, price, relativeSv, sek, timeSv, trendClass } from "@/lib/format";
import { cn, instrumentPath, INSTRUMENT_TYPE_LABEL } from "@/lib/utils";
import { Card, Change, InstrumentAvatar, RiskScale } from "@/components/ui";
import { PriceChart } from "@/components/charts/price-chart";
import { LiveQuote } from "./live-quote";
import { OrderDepth } from "./order-depth";
import { OrderForm, type OrderAccount } from "./order-form";
import { AlertButton, WatchButton } from "./watch-button";

const REC: Record<string, string> = { strong_buy: "Starkt köp", buy: "Köp", hold: "Behåll", underperform: "Underprestera", sell: "Sälj" };

export async function InstrumentView({ symbol, expected, side }: { symbol: string; expected: "STOCK" | "FUND" | "ETF" | "INDEX"; side?: "BUY" | "SELL" }) {
  const inst = await getInstrument(symbol);
  if (!inst) notFound();
  const correctPath = instrumentPath(inst);
  const expectedOk = expected === "INDEX" ? !["STOCK", "FUND", "ETF"].includes(inst.type) : inst.type === expected;
  if (!expectedOk) redirect(correctPath);

  const user = await getUser();
  const [quotes, profile, news, owners, fx] = await Promise.all([
    liveQuotes([inst]),
    ["STOCK", "FUND", "ETF"].includes(inst.type) ? getProfile(inst.symbol, inst.type) : Promise.resolve(null),
    getNews(inst.type === "STOCK" ? inst.name.replace(/\s*\(publ\)|\bAB\b|\bASA\b|Inc\.|Corporation/g, "").trim() : inst.name),
    ownersCount(inst.id),
    getFxRates(),
  ]);
  const q = quotes.get(inst.id);
  const venue = venueForSymbol(inst.symbol);
  const open = isMarketOpen(venue);
  const isFund = inst.type === "FUND";
  const tradable = inst.tradable && ["STOCK", "FUND", "ETF"].includes(inst.type);

  let orderAccounts: OrderAccount[] = [];
  let lists: { id: string; name: string; has: boolean }[] = [];
  let positions: Awaited<ReturnType<typeof myPositions>> = [];
  if (user) {
    const accs = await db.select().from(schema.accounts).where(and(eq(schema.accounts.userId, user.id), inArray(schema.accounts.type, ["ISK", "KF", "AF"])));
    orderAccounts = await Promise.all(
      accs.map(async (a) => ({ id: a.id, name: a.name, number: a.accountNumber, buyingPower: await buyingPower(a.id), available: await availableQuantity(a.id, inst.id) })),
    );
    orderAccounts.sort((a, b) => b.available - a.available || b.buyingPower - a.buyingPower);
    const wls = await db.select().from(schema.watchlists).where(eq(schema.watchlists.userId, user.id));
    const items = wls.length
      ? await db.select().from(schema.watchlistItems).where(and(inArray(schema.watchlistItems.watchlistId, wls.map((w) => w.id)), eq(schema.watchlistItems.instrumentId, inst.id)))
      : [];
    lists = wls.map((w) => ({ id: w.id, name: w.name, has: items.some((i) => i.watchlistId === w.id) }));
    positions = await myPositions(user.id, inst.id);
  }
  const rate = fx[inst.currency] ?? 1;
  const intraday = !isFund && inst.type !== "INDEX" ? (await getChart(inst.symbol, "1D")).slice(-12).reverse() : [];

  const keyFigures: [string, string][] =
    inst.type === "STOCK"
      ? [
          ["Börsvärde", q?.marketCap ? `${compact(q.marketCap)} ${inst.currency}` : "–"],
          ["P/E-tal", num(q?.pe, 2)],
          ["P/S-tal", num(profile?.priceToSales, 2)],
          ["P/B-tal", num(q?.priceToBook, 2)],
          ["Vinst/aktie", num(q?.eps, 2)],
          ["Direktavkastning", q?.dividendYield != null ? pct(q.dividendYield, 2, false) : "–"],
          ["Utdelning/aktie", num(q?.dividendRate, 2)],
          ["Beta", num(profile?.beta, 2)],
          ["Vinstmarginal", profile?.profitMargin != null ? pct(profile.profitMargin * 100, 1, false) : "–"],
          ["Avkastning på EK", profile?.returnOnEquity != null ? pct(profile.returnOnEquity * 100, 1, false) : "–"],
          ["Antal aktier", compact(q?.sharesOutstanding)],
          ["Omsättning (12 mån)", profile?.revenue ? `${compact(profile.revenue)} ${inst.currency}` : "–"],
        ]
      : inst.type === "ETF"
        ? [
            ["Förvaltningsavgift", profile?.expenseRatio != null ? pct(profile.expenseRatio * 100, 2, false) : "–"],
            ["Kategori", profile?.category ?? "–"],
            ["Fondbolag", profile?.fundFamily ?? "–"],
            ["Startdatum", profile?.inception ?? "–"],
          ]
        : [];

  const stats: [string, string][] = [
    ["Köp", price(q?.bid)],
    ["Sälj", price(q?.ask)],
    ["Högst", price(q?.high)],
    ["Lägst", price(q?.low)],
    ["Öppning", price(q?.open)],
    ["Föreg. stäng.", price(q?.prevClose)],
    ["Omsatt antal", compact(q?.volume)],
    ["52 v. högst", price(q?.high52)],
    ["52 v. lägst", price(q?.low52)],
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <InstrumentAvatar name={inst.name} size={44} />
          <div>
            <h1 className="h1">{inst.name}</h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="font-medium text-fg">{inst.ticker}</span>
              <span>·</span>
              <span>{INSTRUMENT_TYPE_LABEL[inst.type]}</span>
              {inst.segment ? (
                <>
                  <span>·</span>
                  <span>{inst.segment}</span>
                </>
              ) : null}
              {inst.exchange ? (
                <>
                  <span>·</span>
                  <span>{inst.exchange}</span>
                </>
              ) : null}
              {!isFund && inst.type !== "INDEX" && inst.type !== "CURRENCY" ? (
                <span className={cn("badge", open ? "bg-pos-soft text-pos" : "bg-surface-2 text-muted")}>{open ? "Handlas nu" : "Stängd"}</span>
              ) : null}
            </div>
          </div>
        </div>
        {user ? (
          <div className="flex gap-2">
            <AlertButton instrumentId={inst.id} last={q?.last ?? null} />
            <WatchButton instrumentId={inst.id} lists={lists} />
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="card-pad">
            {q ? (
              <LiveQuote
                id={inst.id}
                currency={inst.type === "INDEX" ? "" : inst.currency}
                initial={{ last: q.last, change: q.change, changePct: q.changePct, bid: q.bid, ask: q.ask, high: q.high, low: q.low, volume: q.volume, updatedAt: q.updatedAt.toISOString(), marketTime: q.marketTime?.toISOString() ?? null }}
              />
            ) : (
              <p className="text-muted">Kurs saknas</p>
            )}
            <div className="mt-4">
              <PriceChart symbol={inst.symbol} prevClose={q?.prevClose} initialRange={isFund ? "1Å" : "1D"} />
            </div>
            {!isFund ? (
              <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3 border-t border-border pt-4 text-sm sm:grid-cols-5 lg:grid-cols-9">
                {stats.map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-muted">{k}</div>
                    <div className="font-medium tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>

          {isFund ? (
            <Card title="Fondfakta" className="pb-5">
              <div className="grid gap-5 px-5 pt-4 sm:grid-cols-2">
                <dl className="space-y-2 text-sm">
                  {[
                    ["NAV-kurs", `${price(q?.last)} ${inst.currency}`],
                    ["NAV-datum", dateSv(q?.marketTime)],
                    ["Kategori", inst.fundCategory ?? profile?.category ?? "–"],
                    ["Fondbolag", inst.fundCompany ?? profile?.fundFamily ?? "–"],
                    ["Avgift (årlig)", inst.fundFee != null ? `${num(inst.fundFee, 2)} %` : "–"],
                    ["Minsta köp", sek(inst.minInvestment ?? 100, 0)],
                    ["Startdatum", profile?.inception ?? "–"],
                    ["Courtage", "0 kr"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <div className="mb-2 text-xs text-muted">Risknivå (indikativ, 1–7)</div>
                  <RiskScale value={inst.fundRisk} />
                  {profile?.returns?.length ? (
                    <table className="mt-5 w-full text-sm">
                      <tbody>
                        {profile.returns.map((r) => (
                          <tr key={r.label}>
                            <td className="py-1 text-muted">{r.label}</td>
                            <td className={cn("py-1 text-right font-medium tabular-nums", trendClass(r.value))}>{pct(r.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : null}
                </div>
              </div>
              {profile?.topHoldings?.length ? (
                <div className="mt-6 px-5">
                  <div className="mb-2 text-sm font-semibold">Största innehav</div>
                  <ul className="space-y-1.5 text-sm">
                    {profile.topHoldings.map((h) => (
                      <li key={h.name} className="flex items-center gap-3">
                        <span className="w-48 truncate">{h.name}</span>
                        <span className="h-1.5 flex-1 rounded-full bg-surface-2">
                          <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.min(100, h.pct * 8)}%` }} />
                        </span>
                        <span className="w-14 text-right tabular-nums">{pct(h.pct, 1, false)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>
          ) : null}

          {keyFigures.length ? (
            <Card title="Nyckeltal" className="pb-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 pt-4 text-sm sm:grid-cols-3 lg:grid-cols-4">
                {keyFigures.map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-muted">{k}</div>
                    <div className="font-medium tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
              {inst.type === "STOCK" && (profile?.exDividendDate || profile?.earningsDate || profile?.recommendation) ? (
                <div className="mt-5 flex flex-wrap gap-2 px-5 text-xs">
                  {profile?.earningsDate ? <span className="badge bg-surface-2 text-fg">Nästa rapport: {profile.earningsDate}</span> : null}
                  {profile?.exDividendDate ? <span className="badge bg-surface-2 text-fg">X-dag utdelning: {profile.exDividendDate}</span> : null}
                  {profile?.recommendation && profile.recommendation !== "none" ? (
                    <span className="badge bg-brand-soft text-brand">
                      Analytiker: {REC[profile.recommendation] ?? profile.recommendation}
                      {profile.analysts ? ` (${profile.analysts} st)` : ""}
                      {profile.targetPrice ? ` · riktkurs ${price(profile.targetPrice)}` : ""}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </Card>
          ) : null}

          {profile?.description ? (
            <Card title={isFund || inst.type === "ETF" ? "Placeringsinriktning" : "Om bolaget"} className="pb-5">
              <div className="px-5 pt-3 text-sm">
                <p className="line-clamp-6 text-muted">{profile.description}</p>
                {inst.type === "STOCK" ? (
                  <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["Bransch", inst.sector ?? profile.sector],
                      ["Industri", profile.industry],
                      ["VD", profile.ceo],
                      ["Anställda", profile.employees ? num(profile.employees, 0) : null],
                      ["Säte", [profile.city, profile.country].filter(Boolean).join(", ")],
                    ].map(([k, v]) => (
                      <div key={k as string}>
                        <dt className="text-xs text-muted">{k}</dt>
                        <dd className="font-medium">{v || "–"}</dd>
                      </div>
                    ))}
                    {profile.website ? (
                      <div>
                        <dt className="text-xs text-muted">Webbplats</dt>
                        <dd>
                          <a href={profile.website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-medium text-brand">
                            {profile.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} <ExternalLink className="h-3 w-3" />
                          </a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
              </div>
            </Card>
          ) : null}

          <Card title="Nyheter">
            <ul className="divide-y divide-border px-5 pb-2">
              {news.length === 0 ? <li className="py-4 text-sm text-muted">Inga nyheter just nu.</li> : null}
              {news.slice(0, 8).map((n) => (
                <li key={n.id}>
                  <a href={n.link} target="_blank" rel="noreferrer noopener" className="flex gap-3 py-3 hover:text-brand">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{n.title}</span>
                      <span className="text-xs text-muted">
                        {n.publisher} · {relativeSv(n.time)}
                      </span>
                    </span>
                    {n.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.thumb} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" loading="lazy" />
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          {tradable ? (
            <Card className="card-pad">
              <h2 className="h2 mb-3">{isFund ? "Köp/sälj fond" : "Handla"}</h2>
              {user ? (
                <OrderForm
                  instrument={{ id: inst.id, name: inst.name, symbol: inst.symbol, type: inst.type, currency: inst.currency, minInvestment: inst.minInvestment }}
                  quote={{ last: q?.last ?? null, bid: q?.bid ?? null, ask: q?.ask ?? null }}
                  accounts={orderAccounts}
                  courtageClass={user.courtageClass}
                  tradedVolumeSek={user.tradedVolumeSek}
                  fx={rate}
                  defaultValidUntil={defaultValidity(inst.symbol)}
                  defaultSide={side}
                  marketOpen={open}
                />
              ) : (
                <div className="space-y-3 text-sm">
                  <p className="text-muted">Logga in för att handla {inst.name}.</p>
                  <Link href={`/logga-in?next=${encodeURIComponent(correctPath)}`} className="btn-primary w-full">
                    Logga in med BankID
                  </Link>
                </div>
              )}
            </Card>
          ) : null}

          {positions.length ? (
            <Card title="Mitt innehav" className="pb-4">
              <ul className="space-y-3 px-5 pt-3 text-sm">
                {positions.map(({ h, a }) => {
                  const val = (q?.last ?? h.avgPrice) * h.quantity * rate;
                  const cost = h.avgPriceSek * h.quantity;
                  return (
                    <li key={a.id}>
                      <div className="flex justify-between font-medium">
                        <span>{a.name}</span>
                        <span>{sek(val, 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted">
                        <span>
                          {num(h.quantity, 0, 4)} st · GAV {price(h.avgPrice)}
                        </span>
                        <Change value={cost ? ((val - cost) / cost) * 100 : 0} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ) : null}

          {!isFund && tradable && q ? (
            <Card title="Orderdjup" className="pb-4">
              <div className="px-5 pt-3">
                <OrderDepth symbol={inst.symbol} bid={q.bid} ask={q.ask} last={q.last} avgVolume={q.avgVolume} currency={inst.currency} />
              </div>
            </Card>
          ) : null}

          {intraday.length ? (
            <Card title="Dagens handel" className="pb-3">
              <table className="mt-2 w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-xs text-muted">
                    <th className="px-5 py-1 text-left font-medium">Tid</th>
                    <th className="px-5 py-1 text-right font-medium">Kurs</th>
                  </tr>
                </thead>
                <tbody>
                  {intraday.map((p, i) => {
                    const prev = intraday[i + 1]?.v;
                    return (
                      <tr key={p.t}>
                        <td className="px-5 py-1 text-muted">{timeSv(new Date(p.t * 1000)).slice(0, 5)}</td>
                        <td className={cn("px-5 py-1 text-right", prev == null ? "" : p.v > prev ? "text-pos" : p.v < prev ? "text-neg" : "")}>{price(p.v)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="px-5 pt-2 text-[11px] text-muted">5-minutersintervall, senaste först.</p>
            </Card>
          ) : null}

          {inst.type !== "INDEX" && inst.type !== "CURRENCY" && inst.type !== "COMMODITY" && inst.type !== "CRYPTO" ? (
            <Card className="card-pad">
              <div className="text-xs text-muted">Antal ägare hos Spira</div>
              <div className="text-2xl font-bold">{num(owners, 0)}</div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
