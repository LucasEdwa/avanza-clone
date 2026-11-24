"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { BankIdFlow } from "@/components/bankid/bankid-flow";

export function LoginBox({ next }: { next?: string }) {
  const router = useRouter();
  const start = useCallback(async () => {
    const r = await fetch("/api/bankid/auth", { method: "POST" });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error ?? "Kunde inte starta BankID");
    return j;
  }, []);
  const complete = useCallback(
    async (orderRef: string) => {
      const r = await fetch("/api/bankid/complete", { method: "POST", body: JSON.stringify({ orderRef, next }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      router.replace(j.redirect);
      router.refresh();
    },
    [router, next],
  );
  return <BankIdFlow intent="auth" start={start} onComplete={complete} />;
}
