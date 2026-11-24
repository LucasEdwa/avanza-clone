"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/min-ekonomi/oversikt", label: "Min ekonomi", match: "/min-ekonomi", auth: true },
  { href: "/marknad", label: "Marknad", match: "/marknad", auth: false },
  { href: "/marknad/fonder", label: "Fonder", match: "/fonder", auth: false },
  { href: "/bevakningar", label: "Bevakningar", match: "/bevakningar", auth: true },
];

export function NavLinks({ loggedIn }: { loggedIn: boolean }) {
  const path = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {LINKS.filter((l) => loggedIn || !l.auth).map((l) => {
        const active =
          l.match === "/marknad" ? path.startsWith("/marknad") && !path.startsWith("/marknad/fonder") || path.startsWith("/aktier") || path.startsWith("/index") : l.match === "/fonder" ? path.startsWith("/marknad/fonder") || path.startsWith("/fonder") : path.startsWith(l.match);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn("rounded-full px-3 py-1.5 text-sm font-medium", active ? "bg-brand-soft text-brand" : "text-muted hover:text-fg")}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
