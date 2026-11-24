import Link from "next/link";
import { Logo } from "@/components/logo";
import { getUser } from "@/lib/auth";
import { TickerBar } from "@/components/landing/ticker-bar";
import { MegaMenu, MobileMenu } from "./mega-menu";
import { NAV } from "@/lib/site-nav";

/** Header for visitors who are not logged in: ticker strip + dropdown menus. */
export async function PublicHeader() {
  const user = await getUser();
  return (
    <>
      <TickerBar />
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Logo />
          <MegaMenu groups={NAV} />
          <Link href="/info/kundservice" className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-fg lg:block">
            Kundservice
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <MobileMenu groups={NAV} />
            {user ? (
              <Link href="/min-ekonomi/oversikt" className="btn-primary">
                Min ekonomi
              </Link>
            ) : (
              <>
                <Link href="/logga-in" className="btn-secondary">
                  Logga in
                </Link>
                <Link href="/logga-in?ny=1" className="btn-primary hidden sm:inline-flex">
                  Bli kund
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
