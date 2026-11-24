"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { hrefFor, type NavGroup, type NavItem } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

/** Desktop header dropdowns with flyout submenus (click or keyboard). */
export function MegaMenu({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(null);
    setSub(null);
  }, [path]);
  useEffect(() => {
    const click = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(null);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", click);
      document.removeEventListener("keydown", key);
    };
  }, []);

  return (
    <div ref={ref} className="hidden items-center gap-0.5 lg:flex">
      {groups.map((g) => (
        <div key={g.key} className="relative">
          <button
            onClick={() => {
              setOpen(open === g.key ? null : g.key);
              setSub(null);
            }}
            aria-expanded={open === g.key}
            className={cn("flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium", open === g.key ? "bg-mint text-fg" : "text-muted hover:text-fg")}
          >
            {g.label}
            <ChevronDown className={cn("h-3.5 w-3.5 transition", open === g.key && "rotate-180")} />
          </button>
          {open === g.key ? (
            <div className="absolute top-full left-0 z-50 mt-1 flex">
              <ul className="card w-72 py-1.5 shadow-xl" role="menu">
                {g.items.map((i) => (
                  <MenuRow key={i.label} item={i} active={sub === i.label} onOpen={() => setSub(i.label)} onLeaf={() => setSub(null)} />
                ))}
              </ul>
              {sub
                ? (() => {
                    const parent = g.items.find((i) => i.label === sub);
                    return parent?.children ? (
                      <ul className="card ml-1 w-64 self-start py-1.5 shadow-xl" role="menu">
                        <li className="px-4 pt-1 pb-2 text-xs font-semibold text-muted uppercase">{parent.label}</li>
                        {parent.children.map((c) => (
                          <li key={c.label}>
                            <Link href={hrefFor(c)} className="block px-4 py-2.5 text-sm hover:bg-mint" role="menuitem">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()
                : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function MenuRow({ item, active, onOpen, onLeaf }: { item: NavItem; active: boolean; onOpen: () => void; onLeaf: () => void }) {
  if (item.children)
    return (
      <li>
        <button onClick={onOpen} onMouseEnter={onOpen} className={cn("flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-mint", active && "bg-mint")} aria-haspopup="menu" aria-expanded={active}>
          {item.label}
          <ChevronRight className="h-4 w-4 text-muted" />
        </button>
      </li>
    );
  return (
    <li>
      <Link href={hrefFor(item)} onMouseEnter={onLeaf} className="block px-4 py-2.5 text-sm hover:bg-mint" role="menuitem">
        {item.label}
      </Link>
    </li>
  );
}

/** Mobile: hamburger with accordion. */
export function MobileMenu({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  const [exp, setExp] = useState<string | null>(null);
  const path = usePathname();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [path]);
  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(!open)} className="rounded-full p-2 hover:bg-surface-2" aria-label="Meny">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open ? (
        <div className="fixed inset-x-0 top-[6.05rem] bottom-0 z-50 overflow-y-auto border-t border-border bg-surface p-2">
          {groups.map((g) => (
            <div key={g.key} className="border-b border-border">
              <button onClick={() => setExp(exp === g.key ? null : g.key)} className="flex w-full items-center justify-between px-3 py-3.5 font-semibold">
                {g.label}
                <ChevronDown className={cn("h-4 w-4 transition", exp === g.key && "rotate-180")} />
              </button>
              {exp === g.key ? (
                <ul className="pb-2">
                  {g.items.map((i) =>
                    i.children ? (
                      <li key={i.label} className="px-3 py-1.5">
                        <div className="text-xs font-semibold text-muted uppercase">{i.label}</div>
                        <ul className="mt-1 border-l border-border pl-3">
                          {i.children.map((c) => (
                            <li key={c.label}>
                              <Link href={hrefFor(c)} className="block py-1.5 text-sm">
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ) : (
                      <li key={i.label}>
                        <Link href={hrefFor(i)} className="block px-3 py-2 text-sm">
                          {i.label}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              ) : null}
            </div>
          ))}
          <Link href="/info/kundservice" className="block px-3 py-3.5 font-semibold">
            Kundservice
          </Link>
        </div>
      ) : null}
    </div>
  );
}
