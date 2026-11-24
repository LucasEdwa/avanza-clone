"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { SignDialog } from "@/components/bankid/sign-dialog";
import { openAccount } from "@/app/actions/money";
import { Notice } from "@/components/ui";
import { cn } from "@/lib/utils";

const TYPES = [
  { type: "ISK", name: "Investeringssparkonto", tag: "Populärast", points: ["Schablonskatt istället för vinstskatt", "Inga skatter på utdelningar och vinster", "Fritt att flytta pengar in och ut"] },
  { type: "KF", name: "Kapitalförsäkring", tag: "Förmånstagare", points: ["Avkastningsskatt (schablon)", "Möjlighet att ange förmånstagare", "Utländsk källskatt kan återfås delvis"] },
  { type: "AF", name: "Aktie- & fondkonto", tag: "Klassisk depå", points: ["30 % skatt på vinst och utdelning", "Avdrag för förluster", "Passar för belåning och kvittning"] },
  { type: "SPARKONTO", name: "Sparkonto", tag: "2,25 % ränta", points: ["Rörlig ränta, utbetalas månadsvis", "Fria uttag", "Omfattas av insättningsgarantin (i verkligheten)"] },
] as const;

export function OpenAccount() {
  const router = useRouter();
  const [sel, setSel] = useState<(typeof TYPES)[number]["type"]>("ISK");
  const [signing, setSigning] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {TYPES.map((t) => (
          <button key={t.type} onClick={() => setSel(t.type)} className={cn("card p-5 text-left", sel === t.type && "border-brand ring-2 ring-brand/30")}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{t.name}</span>
              <span className="badge bg-brand-soft text-brand">{t.tag}</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {t.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-pos" /> {p}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      {err ? (
        <div className="mt-4">
          <Notice kind="error">{err}</Notice>
        </div>
      ) : null}
      <button className="btn-primary mt-6 w-full sm:w-auto" onClick={() => setSigning(true)}>
        Öppna {TYPES.find((t) => t.type === sel)!.name.toLowerCase()} med BankID
      </button>
      {signing ? (
        <SignDialog
          request={{ action: "open-account", type: sel }}
          title="Skriv under ansökan om nytt konto."
          onClose={() => setSigning(false)}
          onSigned={async (orderRef) => {
            const r = await openAccount(orderRef, { action: "open-account", type: sel });
            setSigning(false);
            if (r.error) setErr(r.error);
            else {
              router.push(`/min-ekonomi/konton/${r.id}`);
              router.refresh();
            }
          }}
        />
      ) : null}
    </div>
  );
}
