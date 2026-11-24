"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { relativeSv } from "@/lib/format";
import { cn } from "@/lib/utils";

type N = { id: string; title: string; body: string | null; link: string | null; readAt: string | null; createdAt: string };

export function NotificationBell() {
  const [items, setItems] = useState<N[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = () =>
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j) return;
        setItems(j.items);
        setUnread(j.unread);
      })
      .catch(() => {});

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => {
      clearInterval(t);
      document.removeEventListener("mousedown", h);
    };
  }, []);

  const markAll = async () => {
    await fetch("/api/notifications", { method: "POST", body: "{}" });
    load();
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative rounded-full p-2 hover:bg-surface-2" aria-label="Notiser">
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-neg px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="card fixed inset-x-2 top-16 z-50 max-h-[70vh] overflow-y-auto shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-semibold">Notiser</span>
            {unread > 0 ? (
              <button onClick={markAll} className="text-xs text-brand">
                Markera alla som lästa
              </button>
            ) : null}
          </div>
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">Inga notiser</div>
          ) : (
            items.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "/notiser"}
                onClick={() => {
                  setOpen(false);
                  if (!n.readAt) fetch("/api/notifications", { method: "POST", body: JSON.stringify({ id: n.id }) }).then(load);
                }}
                className={cn("block border-b border-border px-4 py-3 last:border-0 hover:bg-surface-2", !n.readAt && "bg-brand-soft/40")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">{n.title}</span>
                  {!n.readAt ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" /> : null}
                </div>
                {n.body ? <div className="text-xs text-muted">{n.body}</div> : null}
                <div className="mt-1 text-[11px] text-muted">{relativeSv(n.createdAt)}</div>
              </Link>
            ))
          )}
          <Link href="/notiser" onClick={() => setOpen(false)} className="block px-4 py-2 text-center text-sm text-brand">
            Visa alla
          </Link>
        </div>
      ) : null}
    </div>
  );
}
