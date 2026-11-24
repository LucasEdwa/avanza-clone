# Spira – a Swedish online broker (Avanza-style feature clone)

Next.js 16 (App Router, TypeScript) · PostgreSQL 15 · Drizzle ORM · Tailwind CSS v4 · live market data from Yahoo Finance (free, no API key).

Spira copies the **features and flows** of a full Swedish retail broker such as Avanza: BankID login and signing, ISK/KF/AF accounts, courtage classes, order book, order handling, funds, monthly savings, price alerts, ISK tax, and so on. It uses **its own name, logo and colours**, so it can never be mistaken for the real bank.

Status legend: ✅ done · 🟡 partial / simulated / not verified · ⬜ not started

Last updated: 2026-11-24.

---

## Architecture

| Layer | Choice | Notes |
|---|---|---|
| Web | Next.js 16 App Router, React 19, Server Components + Server Actions | `proxy.ts` (formerly middleware) does an optimistic session check |
| Styling | Tailwind v4, Geist font, light + dark theme | Swedish UI, mobile bottom navigation |
| DB | PostgreSQL 15 via `postgres` + Drizzle ORM | schema in `src/db/schema.ts`, SQL migrations in `drizzle/` |
| Market data | `yahoo-finance2` (quote, chart, quoteSummary, search) | quotes cached in Postgres (`quotes`), charts and profiles in `market_cache` |
| Charts | TradingView `lightweight-charts` v5 | area chart for prices, portfolio development |
| Auth | BankID RP API v6 (auth / sign / collect / cancel, animated QR), DB sessions | `BANKID_MODE=simulator` (default) or `test` (real BankID test env, mTLS) |
| Order engine | in-app matcher runs whenever quotes refresh, plus `/api/cron/tick` | Stockholm opening hours and holidays, limit and stop-loss orders, funds at NAV |

---

## Sprint 0 – Foundation ✅
- ✅ Next.js 16 + TypeScript + Tailwind v4 scaffold
- ✅ PostgreSQL database `spira`, Drizzle schema and migrations, `npm run db:*` scripts
- ✅ `.env.example`, README with setup instructions
- ✅ Design system: colours, cards, buttons, tables, number formatting in Swedish (`1 234,56 kr`, `+1,23 %`)
- ✅ Swedish utilities: personnummer validation (Luhn, 10/12 digits), market hours and Swedish exchange holidays 2025–2027, settlement date (T+2)

## Sprint 1 – BankID and authentication ✅ (test environment 🟡)
- ✅ BankID RP API v6 client: `auth`, `sign`, `collect`, `cancel`
- ✅ Animated QR code (`bankid.<qrStartToken>.<seconds>.<HMAC-SHA256(qrStartSecret, seconds)>`), refreshed every second
- ✅ "Mobilt BankID" (QR) and "BankID på den här enheten" (autostart token, `bankid:///?autostarttoken=…`)
- ✅ Every hint code shown with the recommended Swedish user messages (RFA1, RFA2, RFA3, RFA4, RFA5, RFA6, RFA8, RFA9, RFA13, RFA15, RFA16, RFA17, RFA19, RFA21, RFA22, RFA23)
- ✅ **BankID simulator** (`/bankid-simulator`): a phone-style "BankID app" where you pick or enter a personnummer, see the text to sign, type a security code and approve. Same state machine as the real service (`outstandingTransaction → started → userSign → complete`), including the "cancel" and "start failed / timeout" paths
- 🟡 **Real BankID test environment** (`BANKID_MODE=test`): mTLS client written for `appapi2.test.bankid.com`, but **not yet run against it** (needs the test certificate and a test BankID on a phone)
- ✅ BankID **signing** reused for: customer agreement, opening accounts, withdrawals, adding a bank account
- ✅ DB sessions (hashed token, httpOnly cookie, 30 min sliding inactivity timeout like a bank), logout, "log out everywhere"
- ✅ Login history (time, method, IP, device)
- ✅ Become a customer (`/bli-kund`): BankID → contact details → customer due-diligence (KYC) → sign the agreement with BankID → an ISK is opened automatically
- ✅ Demo customer seeded with accounts, holdings and history

## Sprint 2 – Market data ✅
- ✅ Yahoo Finance integration: batched quotes, intraday and historical charts, company profile and key figures, news
- ✅ Postgres cache with TTL (60 s while the market is open, 15 min when closed)
- ✅ Instrument catalogue: about 110 stocks (Stockholm plus selected US and Nordic), indices, FX, commodities, crypto, ETFs and Swedish funds
- ✅ Large / Mid / Small Cap classification from live market cap
- ✅ FX conversion (USD, EUR, NOK, DKK → SEK) for valuation and trading
- ✅ Search (instant search in the header plus a `/sok` page), with discovery of new symbols through Yahoo

## Sprint 3 – Instrument pages ✅
- ✅ Stock page: price, change, buy/sell price, high/low, volume, chart (1D, 1V, 1M, 3M, I år, 1Å, 3Å, 5Å, Max)
- ✅ Key figures: P/E, P/S, P/B, EPS, dividend yield, market cap, 52-week range, beta, number of shares
- ✅ Company info: description, sector, industry, employees, website, CEO
- 🟡 Order depth (5 levels) and recent trades: built from the real bid/ask and tick sizes. Market depth is not available for free, so this is **labelled as simulated**
- ✅ News feed for the instrument
- ✅ "Owners at Spira" plus "My position in this instrument"
- ✅ Fund page: NAV, development, fee, risk class 1–7, category, minimum investment, fund-specific information
- ✅ ETF and index pages

## Sprint 4 – Accounts and money ✅
- ✅ Account types: Investeringssparkonto (ISK), Kapitalförsäkring (KF), Aktie- & fondkonto (AF), Sparkonto (savings account with interest)
- ✅ Open new accounts (signed with BankID), rename accounts
- ✅ Account page: value, buying power, cash, development, holdings, transactions
- ✅ Deposits (from a linked bank account, instant) and withdrawals (signed with BankID, reduced by buying power)
- ✅ Internal transfers between own accounts
- ✅ Linked external bank accounts (clearing number validation)

## Sprint 5 – Trading ✅
- ✅ Order form: buy/sell, limit price, quantity, total, courtage preview, "valid until" date, price-tick validation
- ✅ Order types: limit, stop-loss (trigger + limit), fund orders by amount (buy) or units/amount (sell)
- ✅ Courtage classes: Start, Mini, Small, Medium, Fast pris (switch from your profile)
- ✅ Currency-exchange fee (0.25 %) for foreign stocks
- ✅ Buying power: cash minus reserved active buy orders; sell orders reserve units
- ✅ Order matching: Stockholm opening hours (09:00–17:30 CET, holidays), US hours for US stocks, limit-price crossing, funds executed at the next NAV after the 15:00 cut-off
- ✅ Order expiry, cancel and change orders (change = cancel and re-place, original restored on failure)
- ✅ Transactions with settlement date, average price (GAV) including courtage
- ✅ Notifications when orders are filled

## Sprint 6 – My finances / overview ✅
- ✅ Overview: total value, today's change, development over 1M / 3M / I år / 1Å / Max, value chart
- ✅ Portfolio history rebuilt from transactions and real historical prices
- ✅ Accounts list, all holdings (grouped by stocks, funds, ETFs), allocation by type and by account
- ✅ Holdings table: quantity, GAV, last price, change today, market value, unrealised gain (kr and %)
- ✅ Transactions page with filters (account, type, period) and **CSV export**
- ✅ Orders page: active and completed orders

## Sprint 7 – Market ✅
- ✅ Market overview: OMXS30, OMXSPI, global indices, FX, commodities, crypto
- ✅ Top lists: winners, losers, most traded (turnover), most owned at Spira
- ✅ Stock list with filters (list/segment, sector, country) and sortable columns
- ✅ Fund list with filters (category, risk class, fee) and returns
- ✅ ETF list

## Sprint 8 – Watchlists, alerts and notifications ✅
- ✅ Multiple watchlists (create, rename, delete, add or remove instruments)
- ✅ Price alerts (above / below), triggered by the quote refresh
- ✅ Notification centre (bell with unread count, mark as read)

## Sprint 9 – Monthly savings ✅
- ✅ Monthly savings plans: amount, day of the month, account, split across several funds (percentages)
- ✅ Run automatically (the matcher creates the deposit and fund orders on the chosen day) plus "Run now" for demos
- ✅ Pause, resume and delete

## Sprint 10 – Profile, tax and settings ✅
- ✅ Profile: contact details, courtage class, theme (light / dark / system)
- ✅ Customer due diligence (KYC) questionnaire, which can be updated
- ✅ ISK standard tax (schablonskatt): capital base by quarter, tax-free threshold, estimated tax
- ✅ Tax-return data (deklarationsunderlag): realised gains and losses per year for AF accounts (K4-style list)
- ✅ Login history, active sessions, log out everywhere

## Sprint 11 – Polish ✅ (mobile and dark mode review 🟡)
- 🟡 Responsive layout with a mobile bottom tab bar and dark mode (built, not yet visually reviewed on a phone or in dark mode)
- ✅ Loading skeletons, error boundaries, empty states, 404
- ✅ Unit tests (Vitest, 23 tests): personnummer, courtage, tick sizes, market hours, settlement, fund cut-off, BankID QR (incl. the official reference vector), formatting, ISK rate
- ✅ Order engine verified with an integration run against live prices (US fill, Stockholm reservation and cancel, validation errors, fund NAV scheduling)
- ✅ Production build passes, lint passes

## Sprint 12 – Public start page ✅
- ✅ Live index ticker strip (OMXS30, OMXSPI, S&P 500, Nasdaq, DAX, USD/SEK, EUR/SEK, gold, Bitcoin)
- ✅ Hero with "Bli kund" call to action, original illustrations, white and mint section backgrounds
- ✅ "Samla ditt sparande", "Aktuellt från Spira" cards, interactive savings calculator (compound interest)
- ✅ "Så kommer du igång" steps, mobile section, "Lär dig mer", "Redo för nästa steg?", trust section, risk information, full footer

---

## Backlog (not built: needs real-world contracts or paid data)
- ⬜ Production BankID (needs a contract with a bank and a production RP certificate)
- ⬜ Real exchange connectivity (Nasdaq / Xetra / NYSE), real level-2 market depth (paid feed)
- ⬜ Real money movement (Bankgirot, autogiro, Swish)
- ⬜ Occupational pension (tjänstepension) and pension transfers
- ⬜ Options, warrants and certificates, margin lending (belåning)
- ⬜ Corporate actions: automatic dividend payouts, splits, rights issues
- ⬜ Annual statements as PDF, real reporting to the Swedish Tax Agency (Skatteverket)
- ⬜ Mobile app (React Native) and push notifications
- ⬜ Social / forum features (community posts on instruments)
