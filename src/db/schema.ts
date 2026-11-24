import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  timestamp,
  numeric,
  integer,
  boolean,
  jsonb,
  date,
  primaryKey,
  index,
  serial,
  doublePrecision,
} from "drizzle-orm/pg-core";

// ---------- Enums ----------
export const courtageClassEnum = pgEnum("courtage_class", ["START", "MINI", "SMALL", "MEDIUM", "FAST_PRIS"]);
export const accountTypeEnum = pgEnum("account_type", ["ISK", "KF", "AF", "SPARKONTO"]);
export const instrumentTypeEnum = pgEnum("instrument_type", ["STOCK", "FUND", "ETF", "INDEX", "CURRENCY", "COMMODITY", "CRYPTO"]);
export const orderSideEnum = pgEnum("order_side", ["BUY", "SELL"]);
export const orderTypeEnum = pgEnum("order_type", ["LIMIT", "STOP_LOSS", "FUND"]);
export const orderStatusEnum = pgEnum("order_status", ["ACTIVE", "FILLED", "CANCELLED", "EXPIRED", "REJECTED"]);
export const txTypeEnum = pgEnum("tx_type", [
  "BUY",
  "SELL",
  "DEPOSIT",
  "WITHDRAWAL",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "DIVIDEND",
  "INTEREST",
  "TAX",
  "FEE",
]);
export const bankidStatusEnum = pgEnum("bankid_status", ["pending", "complete", "failed"]);
export const bankidIntentEnum = pgEnum("bankid_intent", ["auth", "sign"]);
export const alertDirectionEnum = pgEnum("alert_direction", ["ABOVE", "BELOW"]);

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const money = (name: string) => numeric(name, { precision: 20, scale: 4, mode: "number" });

// ---------- Users & auth ----------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  personalNumber: varchar("personal_number", { length: 12 }).notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  street: text("street"),
  postalCode: varchar("postal_code", { length: 6 }),
  city: text("city"),
  courtageClass: courtageClassEnum("courtage_class").notNull().default("MINI"),
  theme: varchar("theme", { length: 8 }).notNull().default("system"),
  termsSignedAt: ts("terms_signed_at"),
  kycCompletedAt: ts("kyc_completed_at"),
  kyc: jsonb("kyc").$type<Record<string, string | string[]>>(),
  tradedVolumeSek: money("traded_volume_sek").notNull().default(0),
  createdAt: ts("created_at").notNull().defaultNow(),
  lastLoginAt: ts("last_login_at"),
});

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // sha256 of token
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: ts("expires_at").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
    lastSeenAt: ts("last_seen_at").notNull().defaultNow(),
    ip: text("ip"),
    userAgent: text("user_agent"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const loginEvents = pgTable(
  "login_events",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    method: text("method").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("login_events_user_idx").on(t.userId)],
);

export const bankidOrders = pgTable("bankid_orders", {
  orderRef: uuid("order_ref").primaryKey(),
  intent: bankidIntentEnum("intent").notNull(),
  mode: varchar("mode", { length: 16 }).notNull(),
  autoStartToken: uuid("auto_start_token").notNull(),
  qrStartToken: uuid("qr_start_token").notNull(),
  qrStartSecret: uuid("qr_start_secret").notNull(),
  status: bankidStatusEnum("status").notNull().default("pending"),
  hintCode: varchar("hint_code", { length: 40 }).notNull().default("outstandingTransaction"),
  requiredPersonalNumber: varchar("required_personal_number", { length: 12 }),
  userVisibleData: text("user_visible_data"),
  // What the signature is for, e.g. {action:"withdrawal", ...}
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  completion: jsonb("completion").$type<{
    user: { personalNumber: string; name: string; givenName: string; surname: string };
    device?: { ipAddress: string };
    signature?: string;
    ocspResponse?: string;
  }>(),
  consumedAt: ts("consumed_at"),
  ip: text("ip"),
  createdAt: ts("created_at").notNull().defaultNow(),
  completedAt: ts("completed_at"),
});

// ---------- Banking ----------
export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bankName: text("bank_name").notNull(),
  clearing: varchar("clearing", { length: 5 }).notNull(),
  accountNumber: varchar("account_number", { length: 20 }).notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: accountTypeEnum("type").notNull(),
    name: text("name").notNull(),
    accountNumber: varchar("account_number", { length: 20 }).notNull().unique(),
    cash: money("cash").notNull().default(0),
    interestRate: doublePrecision("interest_rate"), // savings accounts
    createdAt: ts("created_at").notNull().defaultNow(),
    closedAt: ts("closed_at"),
  },
  (t) => [index("accounts_user_idx").on(t.userId)],
);

// ---------- Instruments & market data ----------
export const instruments = pgTable(
  "instruments",
  {
    id: serial("id").primaryKey(),
    symbol: varchar("symbol", { length: 32 }).notNull().unique(), // Yahoo symbol
    ticker: varchar("ticker", { length: 32 }).notNull(), // display ticker e.g. "VOLV B"
    name: text("name").notNull(),
    type: instrumentTypeEnum("type").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("SEK"),
    exchange: varchar("exchange", { length: 32 }),
    country: varchar("country", { length: 2 }),
    segment: varchar("segment", { length: 32 }), // Large Cap / Mid Cap / Small Cap / ...
    sector: text("sector"),
    industry: text("industry"),
    tradable: boolean("tradable").notNull().default(true),
    // Fund specific
    fundCategory: text("fund_category"),
    fundFee: doublePrecision("fund_fee"),
    fundRisk: integer("fund_risk"),
    fundCompany: text("fund_company"),
    minInvestment: integer("min_investment"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("instruments_type_idx").on(t.type)],
);

export const quotes = pgTable("quotes", {
  instrumentId: integer("instrument_id")
    .primaryKey()
    .references(() => instruments.id, { onDelete: "cascade" }),
  last: doublePrecision("last"),
  change: doublePrecision("change"),
  changePct: doublePrecision("change_pct"),
  bid: doublePrecision("bid"),
  ask: doublePrecision("ask"),
  open: doublePrecision("open"),
  high: doublePrecision("high"),
  low: doublePrecision("low"),
  prevClose: doublePrecision("prev_close"),
  volume: doublePrecision("volume"),
  avgVolume: doublePrecision("avg_volume"),
  marketCap: doublePrecision("market_cap"),
  pe: doublePrecision("pe"),
  forwardPe: doublePrecision("forward_pe"),
  eps: doublePrecision("eps"),
  priceToBook: doublePrecision("price_to_book"),
  dividendYield: doublePrecision("dividend_yield"),
  dividendRate: doublePrecision("dividend_rate"),
  high52: doublePrecision("high52"),
  low52: doublePrecision("low52"),
  sharesOutstanding: doublePrecision("shares_outstanding"),
  marketState: varchar("market_state", { length: 16 }),
  marketTime: ts("market_time"),
  ytdReturn: doublePrecision("ytd_return"),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

/** Generic JSON cache for charts, profiles, news. */
export const marketCache = pgTable("market_cache", {
  key: text("key").primaryKey(),
  data: jsonb("data").notNull(),
  fetchedAt: ts("fetched_at").notNull().defaultNow(),
});

// ---------- Portfolio ----------
export const holdings = pgTable(
  "holdings",
  {
    accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    instrumentId: integer("instrument_id").notNull().references(() => instruments.id),
    quantity: numeric("quantity", { precision: 24, scale: 6, mode: "number" }).notNull(),
    // Average acquisition price in instrument currency (GAV), courtage included
    avgPrice: doublePrecision("avg_price").notNull(),
    // Average acquisition cost in SEK per unit (for gains reporting)
    avgPriceSek: doublePrecision("avg_price_sek").notNull(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.accountId, t.instrumentId] })],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    instrumentId: integer("instrument_id").notNull().references(() => instruments.id),
    side: orderSideEnum("side").notNull(),
    type: orderTypeEnum("type").notNull(),
    status: orderStatusEnum("status").notNull().default("ACTIVE"),
    quantity: numeric("quantity", { precision: 24, scale: 6, mode: "number" }), // null for fund amount orders
    amount: money("amount"), // fund orders by amount (SEK)
    limitPrice: doublePrecision("limit_price"),
    triggerPrice: doublePrecision("trigger_price"),
    triggered: boolean("triggered").notNull().default(false),
    validUntil: date("valid_until", { mode: "string" }).notNull(),
    executeAfter: ts("execute_after"), // funds: NAV time
    reservedSek: money("reserved_sek").notNull().default(0),
    filledQuantity: numeric("filled_quantity", { precision: 24, scale: 6, mode: "number" }),
    fillPrice: doublePrecision("fill_price"),
    courtage: money("courtage"),
    fxRate: doublePrecision("fx_rate"),
    statusReason: text("status_reason"),
    source: varchar("source", { length: 16 }).notNull().default("manual"), // manual | monthly
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
    filledAt: ts("filled_at"),
  },
  (t) => [index("orders_user_idx").on(t.userId), index("orders_status_idx").on(t.status)],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    type: txTypeEnum("type").notNull(),
    instrumentId: integer("instrument_id").references(() => instruments.id),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    quantity: numeric("quantity", { precision: 24, scale: 6, mode: "number" }),
    price: doublePrecision("price"),
    currency: varchar("currency", { length: 3 }).notNull().default("SEK"),
    fxRate: doublePrecision("fx_rate"),
    amount: money("amount").notNull(), // signed SEK effect on cash
    courtage: money("courtage").notNull().default(0),
    fxFee: money("fx_fee").notNull().default(0),
    realizedGain: money("realized_gain"), // SEK, sells only
    description: text("description").notNull(),
    bookedAt: ts("booked_at").notNull().defaultNow(),
    settleDate: date("settle_date", { mode: "string" }),
  },
  (t) => [index("tx_account_idx").on(t.accountId), index("tx_booked_idx").on(t.bookedAt)],
);

// ---------- Engagement ----------
export const watchlists = pgTable("watchlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const watchlistItems = pgTable(
  "watchlist_items",
  {
    watchlistId: uuid("watchlist_id").notNull().references(() => watchlists.id, { onDelete: "cascade" }),
    instrumentId: integer("instrument_id").notNull().references(() => instruments.id, { onDelete: "cascade" }),
    addedAt: ts("added_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.watchlistId, t.instrumentId] })],
);

export const priceAlerts = pgTable("price_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  instrumentId: integer("instrument_id").notNull().references(() => instruments.id, { onDelete: "cascade" }),
  direction: alertDirectionEnum("direction").notNull(),
  price: doublePrecision("price").notNull(),
  active: boolean("active").notNull().default(true),
  triggeredAt: ts("triggered_at"),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 24 }).notNull(),
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    readAt: ts("read_at"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

export const monthlySavings = pgTable("monthly_savings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  bankAccountId: uuid("bank_account_id").references(() => bankAccounts.id, { onDelete: "set null" }),
  amount: money("amount").notNull(),
  dayOfMonth: integer("day_of_month").notNull(),
  allocations: jsonb("allocations").$type<{ instrumentId: number; pct: number }[]>().notNull(),
  active: boolean("active").notNull().default(true),
  lastRunOn: date("last_run_on", { mode: "string" }),
  createdAt: ts("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Instrument = typeof instruments.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Holding = typeof holdings.$inferSelect;
