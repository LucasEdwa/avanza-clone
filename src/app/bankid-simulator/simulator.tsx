"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { normalizePersonnummer, formatPersonnummer } from "@/lib/personnummer";
import { cn } from "@/lib/utils";

type Identity = { personalNumber: string; givenName: string; surname: string };
type Pending = { orderRef: string; intent: "auth" | "sign"; hintCode: string; createdAt: string; requiredPersonalNumber: string | null };

const DEFAULT_IDS: Identity[] = [{ personalNumber: "199003152387", givenName: "Anna", surname: "Lindqvist" }];
const LS = "bankid-sim-identities";

/** Minimal simpleMarkdownV1 renderer (headings, bold, italic) without innerHTML. */
function Markdown({ text }: { text: string }) {
  const inline = (s: string): ReactNode[] =>
    s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) =>
      p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : p.startsWith("*") ? <i key={i}>{p.slice(1, -1)}</i> : p,
    );
  return (
    <div className="space-y-2 text-left text-sm">
      {text.split(/\n\n+/).map((block, i) =>
        block.startsWith("# ") ? (
          <h3 key={i} className="text-base font-bold">
            {block.slice(2)}
          </h3>
        ) : (
          <p key={i}>{inline(block)}</p>
        ),
      )}
    </div>
  );
}

export function Simulator({ autoStartToken }: { autoStartToken?: string }) {
  const [ids, setIds] = useState<Identity[]>(DEFAULT_IDS);
  const [pending, setPending] = useState<Pending[]>([]);
  const [order, setOrder] = useState<{ orderRef: string; intent: "auth" | "sign"; requiredPersonalNumber: string | null } | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [step, setStep] = useState<"home" | "identity" | "confirm" | "done" | "error">("home");
  const [msg, setMsg] = useState("");
  const [pin, setPin] = useState("");
  const [qr, setQr] = useState("");
  const [newId, setNewId] = useState({ pnr: "", givenName: "", surname: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LS) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(s) && s.length) setIds(s);
    } catch {}
  }, []);
  const saveIds = (v: Identity[]) => {
    setIds(v);
    localStorage.setItem(LS, JSON.stringify(v));
  };

  const open = useCallback(async (q: string) => {
    const r = await fetch(`/api/bankid-sim/pending?${q}`);
    const j = await r.json();
    if (!r.ok) {
      setMsg(j.error);
      setStep("error");
      return;
    }
    if (j.order.status !== "pending") {
      setMsg("Begäran är inte längre aktiv.");
      setStep("error");
      return;
    }
    setOrder(j.order);
    setStep("identity");
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (autoStartToken) open(`autostarttoken=${autoStartToken}`);
  }, [autoStartToken, open]);

  useEffect(() => {
    if (step !== "home") return;
    const load = () =>
      fetch("/api/bankid-sim/pending", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => setPending(j.orders ?? []));
    load();
    const t = setInterval(load, 1500);
    return () => clearInterval(t);
  }, [step]);

  const choose = async (id: Identity) => {
    if (!order) return;
    setBusy(true);
    const r = await fetch("/api/bankid-sim/scan", { method: "POST", body: JSON.stringify({ orderRef: order.orderRef, identity: id }) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) {
      setMsg(j.error);
      setStep("error");
      return;
    }
    setText(j.userVisibleData);
    setPin("");
    setStep("confirm");
  };

  const confirm = async () => {
    if (!order) return;
    setBusy(true);
    const r = await fetch("/api/bankid-sim/confirm", { method: "POST", body: JSON.stringify({ orderRef: order.orderRef, securityCode: pin }) });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) {
      setMsg(j.error);
      return;
    }
    setStep("done");
  };

  const cancel = async () => {
    if (order) await fetch("/api/bankid-sim/cancel", { method: "POST", body: JSON.stringify({ orderRef: order.orderRef }) });
    reset();
  };
  const reset = () => {
    setOrder(null);
    setText(null);
    setMsg("");
    setStep("home");
  };

  const addId = () => {
    const pnr = normalizePersonnummer(newId.pnr);
    if (!pnr || !newId.givenName || !newId.surname) {
      setMsg("Ange giltigt personnummer, förnamn och efternamn.");
      return;
    }
    setMsg("");
    saveIds([...ids.filter((i) => i.personalNumber !== pnr), { personalNumber: pnr, givenName: newId.givenName, surname: newId.surname }]);
    setNewId({ pnr: "", givenName: "", surname: "" });
  };

  const verb = order?.intent === "sign" ? "Skriv under" : "Identifiera";

  return (
    <div className="relative h-[780px] w-[380px] overflow-hidden rounded-[48px] border-[10px] border-black bg-[#f3f5f6] text-[#11262e] shadow-2xl">
      <div className="absolute top-0 left-1/2 h-6 w-36 -translate-x-1/2 rounded-b-2xl bg-black" />
      <div className="flex h-full flex-col px-5 pt-10 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-md bg-[#193e4f] px-2 py-0.5 text-sm font-bold text-white">BankID</span>
          <span className="rounded bg-amber-300 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">SIMULATOR · TEST</span>
        </div>

        {step === "home" && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            <div>
              <h2 className="text-lg font-bold">Väntande begäranden</h2>
              <p className="text-xs text-[#55707a]">Motsvarar att läsa av QR-koden med kameran.</p>
            </div>
            {pending.length === 0 ? (
              <div className="rounded-xl bg-white p-4 text-sm text-[#55707a]">Inga aktiva begäranden. Starta en inloggning eller underskrift i Spira.</div>
            ) : (
              pending.map((p) => (
                <button key={p.orderRef} onClick={() => {
                    setOrder({ orderRef: p.orderRef, intent: p.intent, requiredPersonalNumber: p.requiredPersonalNumber });
                    setStep("identity");
                  }} className="rounded-xl bg-white p-4 text-left shadow-sm hover:ring-2 hover:ring-[#193e4f]">
                  <div className="font-semibold">{p.intent === "auth" ? "Identifiering" : "Underskrift"} · Spira</div>
                  <div className="text-xs text-[#55707a]">
                    {new Date(p.createdAt).toLocaleTimeString("sv-SE")}
                    {p.requiredPersonalNumber ? ` · ${formatPersonnummer(p.requiredPersonalNumber)}` : ""}
                  </div>
                </button>
              ))
            )}
            <div className="mt-auto rounded-xl bg-white p-4">
              <label className="text-xs font-semibold">Klistra in QR-data (bankid.…)</label>
              <div className="mt-1 flex gap-2">
                <input value={qr} onChange={(e) => setQr(e.target.value)} className="w-full rounded-lg border px-2 py-1 font-mono text-xs" placeholder="bankid.xxxx.12.abcd…" />
                <button className="rounded-lg bg-[#193e4f] px-3 text-sm text-white" onClick={() => open(`qr=${encodeURIComponent(qr)}`)}>
                  Läs
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "identity" && order && (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            <h2 className="text-lg font-bold">{order.intent === "auth" ? "Identifiera dig hos Spira" : "Skriv under hos Spira"}</h2>
            <p className="text-xs text-[#55707a]">Välj vilket BankID (vilken person) som ska användas.</p>
            {ids.map((i) => {
              const blocked = !!order.requiredPersonalNumber && order.requiredPersonalNumber !== i.personalNumber;
              return (
                <button
                  key={i.personalNumber}
                  disabled={busy}
                  onClick={() => choose(i)}
                  className={cn("rounded-xl bg-white p-3 text-left shadow-sm hover:ring-2 hover:ring-[#193e4f]", blocked && "opacity-40")}
                >
                  <div className="font-semibold">
                    {i.givenName} {i.surname}
                  </div>
                  <div className="text-xs text-[#55707a]">{formatPersonnummer(i.personalNumber)}</div>
                </button>
              );
            })}
            <details className="rounded-xl bg-white p-3 text-sm">
              <summary className="cursor-pointer font-semibold">Lägg till test-identitet</summary>
              <div className="mt-2 space-y-2">
                <input className="w-full rounded-lg border px-2 py-1" placeholder="Personnummer ÅÅÅÅMMDD-XXXX" value={newId.pnr} onChange={(e) => setNewId({ ...newId, pnr: e.target.value })} />
                <input className="w-full rounded-lg border px-2 py-1" placeholder="Förnamn" value={newId.givenName} onChange={(e) => setNewId({ ...newId, givenName: e.target.value })} />
                <input className="w-full rounded-lg border px-2 py-1" placeholder="Efternamn" value={newId.surname} onChange={(e) => setNewId({ ...newId, surname: e.target.value })} />
                <button className="w-full rounded-lg bg-[#193e4f] py-1.5 text-white" onClick={addId}>
                  Spara
                </button>
                <p className="text-[11px] text-[#55707a]">Personnumret måste ha korrekt kontrollsiffra (Luhn).</p>
              </div>
            </details>
            {msg ? <p className="text-sm text-red-700">{msg}</p> : null}
            <button className="mt-auto rounded-full border border-[#193e4f] py-2 font-semibold" onClick={cancel}>
              Avbryt
            </button>
          </div>
        )}

        {step === "confirm" && order && (
          <div className="flex flex-1 flex-col gap-4">
            <h2 className="text-lg font-bold">{verb}</h2>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-2 text-xs font-semibold text-[#55707a] uppercase">Spira (test)</div>
              {text ? <Markdown text={text} /> : <p className="text-sm">Identifiering för inloggning hos Spira.</p>}
            </div>
            <label className="text-sm font-semibold">Säkerhetskod</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && pin.length === 6 && confirm()}
              className="rounded-xl border bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.5em]"
              placeholder="••••••"
            />
            <p className="text-[11px] text-[#55707a]">Valfria 6 siffror i testläget.</p>
            {msg ? <p className="text-sm text-red-700">{msg}</p> : null}
            <div className="mt-auto flex flex-col gap-2">
              <button disabled={pin.length !== 6 || busy} onClick={confirm} className="rounded-full bg-[#193e4f] py-3 font-semibold text-white disabled:opacity-40">
                {verb}
              </button>
              <button onClick={cancel} className="rounded-full border border-[#193e4f] py-2 font-semibold">
                Avbryt
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600 text-4xl text-white">✓</div>
            <h2 className="text-lg font-bold">{order?.intent === "sign" ? "Underskriften är klar" : "Identifieringen är klar"}</h2>
            <p className="text-sm text-[#55707a]">Gå tillbaka till Spira.</p>
            <button
              onClick={() => {
                if (autoStartToken) window.close();
                reset();
              }}
              className="rounded-full bg-[#193e4f] px-6 py-2 font-semibold text-white"
            >
              Klar
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-4xl text-white">!</div>
            <p className="text-sm">{msg}</p>
            <button onClick={reset} className="rounded-full bg-[#193e4f] px-6 py-2 font-semibold text-white">
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
