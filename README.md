# Spira – Swedish online broker (feature clone)

A Next.js 16 + PostgreSQL clone of a Swedish retail broker (Avanza-style features) with its own brand.
BankID login/signing, ISK/KF/AF/savings accounts, live Stockholm/US market data, order matching,
funds, monthly savings, price alerts and ISK tax. See **[plan.md](plan.md)** for the sprint plan and status.

## Requirements
- Node 20.9+ (tested on 24)
- PostgreSQL 15 running locally (`brew services start postgresql@15`)

## Setup
```bash
npm install
cp .env.example .env           # then set AUTH_SECRET (openssl rand -hex 32)
createdb spira
npm run db:migrate              # create tables
npm run db:seed                 # instruments + live quotes + demo customer (~1 min, fetches Yahoo)
npm run dev                     # http://localhost:3000
```

`npm run db:reset` drops everything, migrates and seeds again.

## Logging in (BankID simulator)
1. Go to `/logga-in`.
2. Open `/bankid-simulator` in another window or on your phone (same network). It acts as the BankID app.
3. Choose the pending request (or click **På den här enheten** on the login page, which opens the simulator with the autostart token).
4. Choose identity **Anna Lindqvist 19900315-2387** (demo customer with two years of history) and enter any 6-digit security code.

To become a **new customer**, add another identity in the simulator with a valid personnummer (correct Luhn check digit).
You will go through onboarding: contact details → KYC → choose account → sign the agreement with BankID.

### Real BankID test environment
Set `BANKID_MODE=test` and point `BANKID_PFX_PATH` / `BANKID_CA_PATH` at the public RP test certificate and CA from
BankID's developer pages (passphrase `qwerty123`). You then need a **test BankID** in the BankID app on your phone
(created at demo.bankid.com). The simulator is disabled in this mode.

## Market data
Yahoo Finance via `yahoo-finance2` (free, no key). Quotes are cached in Postgres (60 s while the market is open,
15 min when closed). Order depth volumes are simulated around the real best bid/ask, because level-2 data is not free.

## Background jobs
`src/instrumentation.ts` runs a ticker every 30 s in the Node server: refreshes quotes for instruments with active
orders or alerts, matches orders, triggers alerts, runs monthly savings plans and credits savings-account interest.
In production you can call `GET /api/cron/tick` with `Authorization: Bearer $CRON_SECRET` instead.

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `start` | production build / server |
| `npm test` | unit tests (Vitest) |
| `npm run lint` / `typecheck` | ESLint / tsc |
| `npm run db:generate` | new migration from `src/db/schema.ts` |

## Structure
```
src/app/(public)        start page, login, onboarding
src/app/(app)           logged-in app: min-ekonomi, marknad, aktier, fonder, profil …
src/app/api             BankID, simulator, quotes, charts, search, notifications, CSV export, cron
src/app/actions         server actions (trading, money, watchlists, savings, profile)
src/lib/bankid          RP API v6 client, QR, hint-code messages, simulator, signing
src/lib/trading         order engine (placement, matching, fills, alerts, savings, interest)
src/lib/market          Yahoo client, Postgres cache, quotes, FX, charts/profile/news
src/db                  Drizzle schema + client
scripts                 seed, reset, instrument catalog
```

Spira is a demonstration. No real money or securities are handled.
