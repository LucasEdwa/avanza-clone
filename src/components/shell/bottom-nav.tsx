"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Home, LineChart, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/min-ekonomi/oversikt", label: "Hem", icon: Home, match: "/min-ekonomi" },
  { href: "/marknad", label: "Marknad", icon: LineChart, match: "/marknad" },
  { href: "/sok", label: "Sök", icon: Search, match: "/sok" },
  { href: "/bevakningar", label: "Bevakningar", icon: Eye, match: "/bevakningar" },
  { href: "/profil", label: "Profil", icon: User, match: "/profil" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon, match }) => (
          <Link key={href} href={href} className={cn("flex flex-col items-center gap-0.5 py-2 text-[11px]", path.startsWith(match) ? "text-brand" : "text-muted")}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
