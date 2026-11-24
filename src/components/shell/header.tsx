import Link from "next/link";
import { Logo } from "@/components/logo";
import type { User } from "@/db/schema";
import { SearchBox } from "./search-box";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import { NavLinks } from "./nav-links";

export function Header({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Logo href={user ? "/min-ekonomi/oversikt" : "/"} />
        <NavLinks loggedIn={!!user} />
        <div className="ml-auto flex items-center gap-2">
          <SearchBox />
          {user ? (
            <>
              <NotificationBell />
              <UserMenu name={`${user.firstName} ${user.lastName}`} />
            </>
          ) : (
            <Link href="/logga-in" className="btn-primary">
              Logga in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
