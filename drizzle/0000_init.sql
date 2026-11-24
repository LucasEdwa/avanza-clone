CREATE TYPE "public"."account_type" AS ENUM('ISK', 'KF', 'AF', 'SPARKONTO');--> statement-breakpoint
CREATE TYPE "public"."alert_direction" AS ENUM('ABOVE', 'BELOW');--> statement-breakpoint
CREATE TYPE "public"."bankid_intent" AS ENUM('auth', 'sign');--> statement-breakpoint
CREATE TYPE "public"."bankid_status" AS ENUM('pending', 'complete', 'failed');--> statement-breakpoint
CREATE TYPE "public"."courtage_class" AS ENUM('START', 'MINI', 'SMALL', 'MEDIUM', 'FAST_PRIS');--> statement-breakpoint
CREATE TYPE "public"."instrument_type" AS ENUM('STOCK', 'FUND', 'ETF', 'INDEX', 'CURRENCY', 'COMMODITY', 'CRYPTO');--> statement-breakpoint
CREATE TYPE "public"."order_side" AS ENUM('BUY', 'SELL');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('ACTIVE', 'FILLED', 'CANCELLED', 'EXPIRED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('LIMIT', 'STOP_LOSS', 'FUND');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT', 'DIVIDEND', 'INTEREST', 'TAX', 'FEE');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "account_type" NOT NULL,
	"name" text NOT NULL,
	"account_number" varchar(20) NOT NULL,
	"cash" numeric(20, 4) DEFAULT 0 NOT NULL,
	"interest_rate" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	CONSTRAINT "accounts_account_number_unique" UNIQUE("account_number")
);
--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bank_name" text NOT NULL,
	"clearing" varchar(5) NOT NULL,
	"account_number" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bankid_orders" (
	"order_ref" uuid PRIMARY KEY NOT NULL,
	"intent" "bankid_intent" NOT NULL,
	"mode" varchar(16) NOT NULL,
	"auto_start_token" uuid NOT NULL,
	"qr_start_token" uuid NOT NULL,
	"qr_start_secret" uuid NOT NULL,
	"status" "bankid_status" DEFAULT 'pending' NOT NULL,
	"hint_code" varchar(40) DEFAULT 'outstandingTransaction' NOT NULL,
	"required_personal_number" varchar(12),
	"user_visible_data" text,
	"payload" jsonb,
	"completion" jsonb,
	"consumed_at" timestamp with time zone,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "holdings" (
	"account_id" uuid NOT NULL,
	"instrument_id" integer NOT NULL,
	"quantity" numeric(24, 6) NOT NULL,
	"avg_price" double precision NOT NULL,
	"avg_price_sek" double precision NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "holdings_account_id_instrument_id_pk" PRIMARY KEY("account_id","instrument_id")
);
--> statement-breakpoint
CREATE TABLE "instruments" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" varchar(32) NOT NULL,
	"ticker" varchar(32) NOT NULL,
	"name" text NOT NULL,
	"type" "instrument_type" NOT NULL,
	"currency" varchar(3) DEFAULT 'SEK' NOT NULL,
	"exchange" varchar(32),
	"country" varchar(2),
	"segment" varchar(32),
	"sector" text,
	"industry" text,
	"tradable" boolean DEFAULT true NOT NULL,
	"fund_category" text,
	"fund_fee" double precision,
	"fund_risk" integer,
	"fund_company" text,
	"min_investment" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instruments_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "login_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"method" text NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_cache" (
	"key" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monthly_savings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"bank_account_id" uuid,
	"amount" numeric(20, 4) NOT NULL,
	"day_of_month" integer NOT NULL,
	"allocations" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_run_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" varchar(24) NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"instrument_id" integer NOT NULL,
	"side" "order_side" NOT NULL,
	"type" "order_type" NOT NULL,
	"status" "order_status" DEFAULT 'ACTIVE' NOT NULL,
	"quantity" numeric(24, 6),
	"amount" numeric(20, 4),
	"limit_price" double precision,
	"trigger_price" double precision,
	"triggered" boolean DEFAULT false NOT NULL,
	"valid_until" date NOT NULL,
	"execute_after" timestamp with time zone,
	"reserved_sek" numeric(20, 4) DEFAULT 0 NOT NULL,
	"filled_quantity" numeric(24, 6),
	"fill_price" double precision,
	"courtage" numeric(20, 4),
	"fx_rate" double precision,
	"status_reason" text,
	"source" varchar(16) DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"filled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "price_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"instrument_id" integer NOT NULL,
	"direction" "alert_direction" NOT NULL,
	"price" double precision NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"triggered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"instrument_id" integer PRIMARY KEY NOT NULL,
	"last" double precision,
	"change" double precision,
	"change_pct" double precision,
	"bid" double precision,
	"ask" double precision,
	"open" double precision,
	"high" double precision,
	"low" double precision,
	"prev_close" double precision,
	"volume" double precision,
	"avg_volume" double precision,
	"market_cap" double precision,
	"pe" double precision,
	"forward_pe" double precision,
	"eps" double precision,
	"price_to_book" double precision,
	"dividend_yield" double precision,
	"dividend_rate" double precision,
	"high52" double precision,
	"low52" double precision,
	"shares_outstanding" double precision,
	"market_state" varchar(16),
	"market_time" timestamp with time zone,
	"ytd_return" double precision,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"type" "tx_type" NOT NULL,
	"instrument_id" integer,
	"order_id" uuid,
	"quantity" numeric(24, 6),
	"price" double precision,
	"currency" varchar(3) DEFAULT 'SEK' NOT NULL,
	"fx_rate" double precision,
	"amount" numeric(20, 4) NOT NULL,
	"courtage" numeric(20, 4) DEFAULT 0 NOT NULL,
	"fx_fee" numeric(20, 4) DEFAULT 0 NOT NULL,
	"realized_gain" numeric(20, 4),
	"description" text NOT NULL,
	"booked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"settle_date" date
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"personal_number" varchar(12) NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"street" text,
	"postal_code" varchar(6),
	"city" text,
	"courtage_class" "courtage_class" DEFAULT 'MINI' NOT NULL,
	"theme" varchar(8) DEFAULT 'system' NOT NULL,
	"terms_signed_at" timestamp with time zone,
	"kyc_completed_at" timestamp with time zone,
	"kyc" jsonb,
	"traded_volume_sek" numeric(20, 4) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "users_personal_number_unique" UNIQUE("personal_number")
);
--> statement-breakpoint
CREATE TABLE "watchlist_items" (
	"watchlist_id" uuid NOT NULL,
	"instrument_id" integer NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watchlist_items_watchlist_id_instrument_id_pk" PRIMARY KEY("watchlist_id","instrument_id")
);
--> statement-breakpoint
CREATE TABLE "watchlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_events" ADD CONSTRAINT "login_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_savings" ADD CONSTRAINT "monthly_savings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_savings" ADD CONSTRAINT "monthly_savings_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_savings" ADD CONSTRAINT "monthly_savings_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_watchlist_id_watchlists_id_fk" FOREIGN KEY ("watchlist_id") REFERENCES "public"."watchlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_instrument_id_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "instruments_type_idx" ON "instruments" USING btree ("type");--> statement-breakpoint
CREATE INDEX "login_events_user_idx" ON "login_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tx_account_idx" ON "transactions" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "tx_booked_idx" ON "transactions" USING btree ("booked_at");