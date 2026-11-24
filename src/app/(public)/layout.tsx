import Link from "next/link";
import { Logo } from "@/components/logo";
import { getUser } from "@/lib/auth";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/marknad" className="btn-ghost hidden sm:inline-flex">
              Marknad
            </Link>
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
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        <p>Spira är en demonstrationstjänst. Ingen riktig handel sker och inga riktiga pengar hanteras.</p>
        <p className="mt-1">Marknadsdata från Yahoo Finance, kan vara fördröjd. Historisk avkastning är ingen garanti för framtida avkastning.</p>
      </footer>
    </div>
  );
}
