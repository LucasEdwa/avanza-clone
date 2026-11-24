import { getUser } from "@/lib/auth";
import { Header } from "@/components/shell/header";
import { BottomNav } from "@/components/shell/bottom-nav";
import { SessionTimer } from "@/components/shell/session-timer";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-24 md:pb-12">{children}</main>
      {user ? (
        <>
          <BottomNav />
          <SessionTimer idleMinutes={Number(process.env.SESSION_IDLE_MINUTES ?? 30)} />
        </>
      ) : null}
      <footer className="hidden border-t border-border py-6 text-center text-xs text-muted md:block">
        Spira är en demonstrationstjänst. Kurser från Yahoo Finance, kan vara fördröjda. Orderdjup och avslutslista är simulerade.
      </footer>
    </div>
  );
}
