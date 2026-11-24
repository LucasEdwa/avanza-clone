"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { logout } from "@/app/actions/session";

export function UserMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const links = [
    ["/profil", "Profil & inställningar"],
    ["/min-ekonomi/oppna-konto", "Öppna konto"],
    ["/min-ekonomi/insattning", "Insättning & uttag"],
    ["/min-ekonomi/manadsspara", "Månadsspara"],
    ["/kursvarningar", "Kursvarningar"],
    ["/min-ekonomi/skatt", "Skatt & deklaration"],
    ["/profil/sakerhet", "Säkerhet & inloggningar"],
  ];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1 hover:bg-surface-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand">
          <User className="h-4 w-4" />
        </span>
        <span className="hidden text-sm font-medium lg:inline">{name}</span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>
      {open ? (
        <div className="card absolute right-0 z-50 mt-2 w-60 overflow-hidden py-1 shadow-xl">
          <div className="border-b border-border px-4 py-2 text-sm font-semibold">{name}</div>
          {links.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-surface-2">
              {label}
            </Link>
          ))}
          <form action={() => logout()} className="border-t border-border">
            <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neg hover:bg-surface-2">
              <LogOut className="h-4 w-4" /> Logga ut
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
