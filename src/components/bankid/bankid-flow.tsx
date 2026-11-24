"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Loader2, QrCode, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

type Started = { orderRef: string; autoStartToken: string; mode: "simulator" | "test" };
type Poll = { status: "pending" | "failed" | "complete"; hintCode: string; message: string; qr: string | null };

export function BankIdBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md bg-[#193e4f] px-1.5 py-0.5 text-[11px] font-bold text-white", className)}>
      BankID
    </span>
  );
}

export function BankIdFlow({
  start,
  onComplete,
  onCancel,
  intent,
  title,
}: {
  start: () => Promise<Started>;
  onComplete: (orderRef: string) => Promise<void> | void;
  onCancel?: () => void;
  intent: "auth" | "sign";
  title?: string;
}) {
  const [method, setMethod] = useState<"qr" | "device">("qr");
  const [order, setOrder] = useState<Started | null>(null);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const doneRef = useRef(false);
  const startedFor = useRef<string | null>(null);

  const begin = useCallback(
    async (m: "qr" | "device") => {
      setError(null);
      setPoll(null);
      setSvg("");
      doneRef.current = false;
      try {
        const o = await start();
        if ((o as unknown as { error?: string }).error) throw new Error((o as unknown as { error: string }).error);
        setOrder(o);
        if (m === "device") {
          if (o.mode === "simulator") window.open(`/bankid-simulator?autostarttoken=${o.autoStartToken}`, "bankid-sim", "width=420,height=820");
          else window.location.href = `bankid:///?autostarttoken=${o.autoStartToken}&redirect=null`;
        }
      } catch (e) {
        setError((e as Error).message || "Kunde inte starta BankID.");
      }
    },
    [start],
  );

  useEffect(() => {
    const key = method;
    if (startedFor.current === key) return;
    startedFor.current = key;
    if (order) fetch("/api/bankid/cancel", { method: "POST", body: JSON.stringify({ orderRef: order.orderRef }) });
    begin(method);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  useEffect(() => {
    if (!order) return;
    let stop = false;
    const tick = async () => {
      if (stop || doneRef.current) return;
      try {
        const r: Poll = await fetch(`/api/bankid/collect?orderRef=${order.orderRef}&qr=${method === "qr" ? 1 : 0}`, {
          cache: "no-store",
        }).then((r) => r.json());
        if (stop) return;
        setPoll(r);
        if (r.qr) setSvg(await QRCode.toString(r.qr, { type: "svg", margin: 1, errorCorrectionLevel: "L" }));
        if (r.status === "complete" && !doneRef.current) {
          doneRef.current = true;
          setFinishing(true);
          try {
            await onComplete(order.orderRef);
          } catch (e) {
            setError((e as Error).message);
            setFinishing(false);
          }
          return;
        }
        if (r.status === "failed") return;
      } catch {
        /* network hiccup – keep polling */
      }
      setTimeout(tick, 1000);
    };
    tick();
    return () => {
      stop = true;
    };
  }, [order, method, onComplete]);

  const cancel = () => {
    if (order && poll?.status === "pending") fetch("/api/bankid/cancel", { method: "POST", body: JSON.stringify({ orderRef: order.orderRef }) });
    onCancel?.();
  };

  const failed = poll?.status === "failed" || !!error;
  const scanned = poll?.hintCode === "userSign" || poll?.hintCode === "started";

  return (
    <div className="flex flex-col items-center gap-4">
      {title ? <h2 className="text-center text-lg font-semibold">{title}</h2> : null}

      <div className="grid w-full grid-cols-2 gap-1 rounded-full bg-surface-2 p-1 text-sm">
        {(
          [
            ["qr", "Mobilt BankID", QrCode],
            ["device", "På den här enheten", Smartphone],
          ] as const
        ).map(([k, label, Icon]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              startedFor.current = null;
              setMethod(k);
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 font-medium",
              method === k ? "bg-surface text-fg shadow-sm" : "text-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex min-h-[248px] w-full flex-col items-center justify-center">
        {finishing ? (
          <div className="flex flex-col items-center gap-3 text-sm text-muted">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            {intent === "auth" ? "Loggar in…" : "Genomför…"}
          </div>
        ) : failed ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="max-w-xs text-sm">{error ?? poll?.message}</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                startedFor.current = method;
                begin(method);
              }}
            >
              Försök igen
            </button>
          </div>
        ) : method === "qr" && !scanned ? (
          svg ? (
            <div
              className="h-[220px] w-[220px] rounded-xl bg-white p-2 [&_svg]:h-full [&_svg]:w-full"
              aria-label="BankID QR-kod"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="skeleton h-[220px] w-[220px]" />
          )
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft">
              <Smartphone className="h-9 w-9 text-brand" />
            </div>
            {method === "device" && !scanned && order ? (
              <button
                type="button"
                className="text-sm font-medium text-brand underline"
                onClick={() =>
                  order.mode === "simulator"
                    ? window.open(`/bankid-simulator?autostarttoken=${order.autoStartToken}`, "bankid-sim", "width=420,height=820")
                    : (window.location.href = `bankid:///?autostarttoken=${order.autoStartToken}&redirect=null`)
                }
              >
                Öppna BankID-appen
              </button>
            ) : null}
          </div>
        )}
      </div>

      {!failed && !finishing ? (
        <p className="min-h-[40px] max-w-xs text-center text-sm text-muted" aria-live="polite">
          {poll?.message ?? (method === "qr" ? "Starta BankID-appen och läs av QR-koden." : "Försöker starta BankID-appen.")}
        </p>
      ) : null}

      {order?.mode === "simulator" && !failed && !finishing ? (
        <a
          href={method === "device" ? `/bankid-simulator?autostarttoken=${order.autoStartToken}` : "/bankid-simulator"}
          target="bankid-sim"
          className="text-xs text-muted underline hover:text-fg"
        >
          Testläge: öppna BankID-simulatorn
        </a>
      ) : null}

      {onCancel ? (
        <button type="button" onClick={cancel} className="btn-ghost w-full">
          Avbryt
        </button>
      ) : null}
    </div>
  );
}
