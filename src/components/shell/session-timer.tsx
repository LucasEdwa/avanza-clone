"use client";

import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/session";

/** Bank-style inactivity logout with a warning one minute before. */
export function SessionTimer({ idleMinutes }: { idleMinutes: number }) {
  const last = useRef(Date.now());
  const lastPing = useRef(Date.now());
  const [warn, setWarn] = useState(false);
  const [left, setLeft] = useState(60);

  useEffect(() => {
    const act = () => {
      last.current = Date.now();
      if (Date.now() - lastPing.current > 60_000) {
        lastPing.current = Date.now();
        fetch("/api/session/ping", { method: "POST" });
      }
    };
    const evs = ["mousedown", "keydown", "touchstart", "scroll"];
    evs.forEach((e) => window.addEventListener(e, act, { passive: true }));
    const t = setInterval(() => {
      const idle = (Date.now() - last.current) / 1000;
      const limit = idleMinutes * 60;
      if (idle >= limit) logout("idle");
      else if (idle >= limit - 60) {
        setWarn(true);
        setLeft(Math.ceil(limit - idle));
      } else setWarn(false);
    }, 1000);
    return () => {
      evs.forEach((e) => window.removeEventListener(e, act));
      clearInterval(t);
    };
  }, [idleMinutes]);

  if (!warn) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="card max-w-sm p-6 text-center">
        <h2 className="h2">Du loggas snart ut</h2>
        <p className="mt-2 text-sm text-muted">Av säkerhetsskäl loggas du ut om {left} sekunder på grund av inaktivitet.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button className="btn-secondary" onClick={() => logout()}>
            Logga ut
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              last.current = Date.now();
              lastPing.current = Date.now();
              fetch("/api/session/ping", { method: "POST" });
              setWarn(false);
            }}
          >
            Fortsätt vara inloggad
          </button>
        </div>
      </div>
    </div>
  );
}
