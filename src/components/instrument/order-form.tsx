"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { placeOrderAction } from "@/app/actions/trading";
import { calcCourtage, calcFxFee, COURTAGE_CLASSES, type CourtageClass } from "@/lib/courtage";
import { num, price, sek } from "@/lib/format";
import { roundToTick, tickDecimals, tickSize, isOnTick } from "@/lib/ticks";
import { Notice } from "@/components/ui";
import { cn } from "@/lib/utils";

export type OrderAccount = { id: string; name: string; number: string; buyingPower: number; available: number };

const parse = (s: string) => Number(String(s).replace(/\s/g, "").replace(",", "."));

export function OrderForm(props: {
  instrument: { id: number; name: string; symbol: string; type: string; currency: string; minInvestment: number | null };
  quote: { last: number | null; bid: number | null; ask: number | null };
  accounts: OrderAccount[];
  courtageClass: CourtageClass;
  tradedVolumeSek: number;
  fx: number;
  defaultValidUntil: string;
  defaultSide?: "BUY" | "SELL";
  marketOpen: boolean;
}) {
  const { instrument: inst, quote, accounts, fx } = props;
  const router = useRouter();
  const isFund = inst.type === "FUND";
  const [side, setSide] = useState<"BUY" | "SELL">(props.defaultSide ?? "BUY");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [qty, setQty] = useState("");
  const [px, setPx] = useState(() => (quote.last ? String(roundToTick(side === "BUY" ? quote.ask ?? quote.last : quote.bid ?? quote.last, inst.currency)).replace(".", ",") : ""));
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"LIMIT" | "STOP_LOSS">("LIMIT");
  const [trigger, setTrigger] = useState("");
  const [validUntil, setValidUntil] = useState(props.defaultValidUntil);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ error?: string; message?: string } | null>(null);
  const [pending, start] = useTransition();

  const acc = accounts.find((a) => a.id === accountId);
  const q = parse(qty);
  const p = parse(px);
  const amt = parse(amount);
  const valueLocal = isFund ? (side === "BUY" ? amt / fx : q * (quote.last ?? 0)) : q * p;
  const valueSek = isFund && side === "BUY" ? amt : valueLocal * fx;
  const courtage = isFund ? 0 : calcCourtage(props.courtageClass, valueSek, props.tradedVolumeSek);
  const fxFee = isFund ? 0 : calcFxFee(valueSek, inst.currency);
  const total = side === "BUY" ? valueSek + courtage + fxFee : valueSek - courtage - fxFee;
  const decimals = p ? tickDecimals(p, inst.currency) : 2;
  const deviation = quote.last && p ? Math.abs(p / quote.last - 1) : 0;

  const error = ((): string | null => {
    if (!acc) return "Välj konto";
    if (isFund) {
      if (side === "BUY") {
        if (!(amt > 0)) return "Ange belopp";
        if (amt < (inst.minInvestment ?? 100)) return `Lägsta belopp är ${sek(inst.minInvestment ?? 100, 0)}`;
        if (amt > acc.buyingPower) return "Otillräcklig köpkraft";
      } else {
        if (!(q > 0)) return "Ange antal andelar";
        if (q > acc.available + 1e-6) return `Du har ${num(acc.available, 0, 4)} andelar tillgängliga`;
      }
      return null;
    }
    if (!Number.isInteger(q) || q <= 0) return "Ange antal (heltal)";
    if (!(p > 0)) return "Ange pris";
    if (!isOnTick(p, inst.currency)) return `Priset måste vara en multipel av ${num(tickSize(p, inst.currency), 0, 4)}`;
    if (type === "STOP_LOSS" && !(parse(trigger) > 0)) return "Ange aktiveringskurs";
    if (side === "BUY" && total > acc.buyingPower) return "Otillräcklig köpkraft";
    if (side === "SELL" && q > acc.available) return `Du har ${num(acc.available, 0)} st tillgängliga`;
    return null;
  })();

  const step = (dir: 1 | -1) => {
    const base = p || quote.last || 0;
    const t = tickSize(base, inst.currency);
    setPx(String(Number((roundToTick(base, inst.currency) + dir * t).toFixed(6))).replace(".", ","));
  };

  const submit = () =>
    start(async () => {
      const r = await placeOrderAction({
        accountId,
        instrumentId: inst.id,
        side,
        type: isFund ? "FUND" : type,
        quantity: isFund ? (side === "SELL" ? q : undefined) : q,
        amount: isFund && side === "BUY" ? amt : undefined,
        limitPrice: isFund ? undefined : p,
        triggerPrice: type === "STOP_LOSS" ? parse(trigger) : undefined,
        validUntil: isFund ? undefined : validUntil,
      });
      setResult(r);
      setConfirming(false);
      if (r.ok) {
        setQty("");
        setAmount("");
        router.refresh();
      }
    });

  if (!accounts.length) return <Notice>Du behöver ett konto för att handla.</Notice>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-surface-2 p-1">
        {(["BUY", "SELL"] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setSide(s);
              setConfirming(false);
              setResult(null);
              if (!isFund && quote.last) setPx(String(roundToTick(s === "BUY" ? quote.ask ?? quote.last : quote.bid ?? quote.last, inst.currency)).replace(".", ","));
            }}
            className={cn("rounded-full py-2 text-sm font-semibold", side === s ? (s === "BUY" ? "bg-pos text-white" : "bg-neg text-white") : "text-muted")}
          >
            {s === "BUY" ? "Köp" : "Sälj"}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="label">Konto</span>
        <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {side === "BUY" ? `köpkraft ${sek(a.buyingPower, 0)}` : `${num(a.available, 0, isFund ? 4 : 0)} ${isFund ? "andelar" : "st"}`}
            </option>
          ))}
        </select>
      </label>

      {isFund ? (
        side === "BUY" ? (
          <label className="block">
            <span className="label">Belopp (kr)</span>
            <input className="input text-lg" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Minst ${inst.minInvestment ?? 100} kr`} />
          </label>
        ) : (
          <label className="block">
            <span className="label">Antal andelar</span>
            <div className="flex gap-2">
              <input className="input text-lg" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} />
              <button type="button" className="btn-secondary" onClick={() => setQty(String(acc?.available ?? 0).replace(".", ","))}>
                Sälj allt
              </button>
            </div>
          </label>
        )
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="label">Antal</span>
              <input className="input" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^\d]/g, ""))} placeholder="0" />
            </label>
            <label className="block">
              <span className="label">Pris ({inst.currency})</span>
              <div className="flex items-center rounded-xl border border-border bg-surface focus-within:border-brand">
                <button type="button" onClick={() => step(-1)} className="px-2 text-muted hover:text-fg" aria-label="Sänk pris">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input className="w-full bg-transparent py-2 text-center text-sm outline-none" inputMode="decimal" value={px} onChange={(e) => setPx(e.target.value)} />
                <button type="button" onClick={() => step(1)} className="px-2 text-muted hover:text-fg" aria-label="Höj pris">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              ["Köp", quote.bid],
              ["Sälj", quote.ask],
              ["Senast", quote.last],
            ].map(([l, v]) =>
              v ? (
                <button key={l as string} type="button" className="chip py-0.5" onClick={() => setPx(String(v).replace(".", ","))}>
                  {l} {price(v as number)}
                </button>
              ) : null,
            )}
            {side === "BUY" && acc && p > 0 ? (
              <button type="button" className="chip py-0.5" onClick={() => setQty(String(Math.max(0, Math.floor((acc.buyingPower * 0.995) / (p * fx * (inst.currency === "SEK" ? 1 : 1.0125))))))}>
                Max antal
              </button>
            ) : null}
            {side === "SELL" && acc?.available ? (
              <button type="button" className="chip py-0.5" onClick={() => setQty(String(Math.floor(acc.available)))}>
                Hela innehavet
              </button>
            ) : null}
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-muted">Fler val (ordertyp, giltighet)</summary>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="block">
                <span className="label">Ordertyp</span>
                <select className="input" value={type} onChange={(e) => setType(e.target.value as "LIMIT" | "STOP_LOSS")}>
                  <option value="LIMIT">Limit</option>
                  <option value="STOP_LOSS">Stop loss</option>
                </select>
              </label>
              <label className="block">
                <span className="label">Giltig t.o.m.</span>
                <input className="input" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </label>
              {type === "STOP_LOSS" ? (
                <label className="col-span-2 block">
                  <span className="label">Aktiveras när senast betalt {side === "SELL" ? "≤" : "≥"}</span>
                  <input className="input" inputMode="decimal" value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder={price(quote.last)} />
                </label>
              ) : null}
            </div>
          </details>
        </>
      )}

      <dl className="space-y-1 rounded-xl bg-surface-2 p-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Ordervärde</dt>
          <dd className="tabular-nums">{valueSek > 0 ? sek(valueSek) : "–"}</dd>
        </div>
        {!isFund ? (
          <div className="flex justify-between">
            <dt className="text-muted">Courtage ({COURTAGE_CLASSES[props.courtageClass].label})</dt>
            <dd className="tabular-nums">{valueSek > 0 ? sek(courtage) : "–"}</dd>
          </div>
        ) : null}
        {fxFee > 0 ? (
          <div className="flex justify-between">
            <dt className="text-muted">Valutaväxling 0,25 %</dt>
            <dd className="tabular-nums">{sek(fxFee)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-border pt-1 font-semibold">
          <dt>{side === "BUY" ? "Totalt att betala" : "Du får ca"}</dt>
          <dd className="tabular-nums">{valueSek > 0 ? sek(total) : "–"}</dd>
        </div>
        {inst.currency !== "SEK" ? <div className="text-xs text-muted">Växelkurs {inst.currency}/SEK {num(fx, 4)}</div> : null}
        {isFund ? <div className="text-xs text-muted">Fondordrar före 15:00 handlas till dagens NAV-kurs. Inget courtage.</div> : null}
      </dl>

      {!isFund && deviation > 0.05 ? <Notice kind="warn">Priset avviker {num(deviation * 100, 1)} % från senaste kurs.</Notice> : null}
      {!isFund && !props.marketOpen ? <Notice>Marknaden är stängd. Ordern läggs i orderboken och kan utföras när handeln öppnar.</Notice> : null}
      {result ? <Notice kind={result.error ? "error" : "success"}>{result.error ?? result.message}</Notice> : null}

      {confirming ? (
        <div className="space-y-2 rounded-xl border border-brand/40 bg-brand-soft p-3 text-sm">
          <div className="font-semibold">Bekräfta order</div>
          <p>
            {side === "BUY" ? "Köp" : "Sälj"} {isFund ? (side === "BUY" ? sek(amt) : `${num(q, 0, 4)} andelar`) : `${num(q, 0)} st à ${num(p, decimals)} ${inst.currency}`} i {inst.name} på {acc?.name}
            {type === "STOP_LOSS" ? `, aktiveras vid ${trigger}` : ""}.
          </p>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => setConfirming(false)} disabled={pending}>
              Ändra
            </button>
            <button className={cn("flex-1", side === "BUY" ? "btn-buy" : "btn-sell")} onClick={submit} disabled={pending}>
              {pending ? "Skickar…" : "Lägg order"}
            </button>
          </div>
        </div>
      ) : (
        <button className={cn("w-full py-3", side === "BUY" ? "btn-buy" : "btn-sell")} disabled={!!error} onClick={() => setConfirming(true)}>
          {error ?? (side === "BUY" ? "Köp" : "Sälj")}
        </button>
      )}
    </div>
  );
}
