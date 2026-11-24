"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { KycForm } from "@/components/kyc-form";
import { SignDialog } from "@/components/bankid/sign-dialog";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Notice } from "@/components/ui";
import { cn } from "@/lib/utils";
import { KYC_QUESTIONS } from "@/lib/kyc";

const STEPS = ["Kontaktuppgifter", "Kundkännedom", "Välj konto", "Avtal"];
const ACCOUNTS = [
  { type: "ISK", name: "Investeringssparkonto (ISK)", desc: "Schablonbeskattning, ingen skatt på vinster och utdelningar. Passar de flesta." },
  { type: "KF", name: "Kapitalförsäkring (KF)", desc: "Schablonbeskattning, möjlighet att ange förmånstagare." },
  { type: "AF", name: "Aktie- & fondkonto (AF)", desc: "30 % skatt på vinster, avdrag för förluster. Deklareras i K4." },
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({ email: "", phone: "", street: "", postalCode: "", city: "" });
  const [kyc, setKyc] = useState<Record<string, string | string[]>>({});
  const [accountType, setAccountType] = useState<"ISK" | "KF" | "AF">("ISK");
  const [accept, setAccept] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactOk =
    /\S+@\S+\.\S+/.test(contact.email) && contact.phone.length >= 7 && contact.street && /^\d{3}\s?\d{2}$/.test(contact.postalCode) && contact.city;
  const kycOk = KYC_QUESTIONS.every((q) => (Array.isArray(kyc[q.id]) ? (kyc[q.id] as string[]).length > 0 : !!kyc[q.id]));

  return (
    <div className="mt-8">
      <ol className="mb-6 flex gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <div className={cn("h-1.5 rounded-full", i <= step ? "bg-brand" : "bg-border")} />
            <div className={cn("mt-1.5 text-xs", i === step ? "font-semibold text-fg" : "text-muted")}>{s}</div>
          </li>
        ))}
      </ol>

      <div className="card p-6">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["email", "E-post", "email"],
                ["phone", "Mobilnummer", "tel"],
                ["street", "Gatuadress", "text"],
                ["postalCode", "Postnummer", "text"],
                ["city", "Ort", "text"],
              ] as const
            ).map(([k, l, t]) => (
              <label key={k} className={k === "street" ? "sm:col-span-2" : ""}>
                <span className="label">{l}</span>
                <input
                  className="input"
                  type={t}
                  value={contact[k]}
                  onChange={(e) => setContact({ ...contact, [k]: e.target.value })}
                  autoComplete={k === "email" ? "email" : k === "phone" ? "tel" : k === "postalCode" ? "postal-code" : k === "city" ? "address-level2" : "street-address"}
                />
              </label>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <p className="mb-5 text-sm text-muted">
              Enligt penningtvättslagen måste vi känna våra kunder. Dina svar behandlas konfidentiellt.
            </p>
            <KycForm value={kyc} onChange={setKyc} />
          </>
        )}
        {step === 2 && (
          <div className="space-y-3">
            {ACCOUNTS.map((a) => (
              <button
                key={a.type}
                type="button"
                onClick={() => setAccountType(a.type)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-4 text-left",
                  accountType === a.type ? "border-brand bg-brand-soft" : "border-border hover:bg-surface-2",
                )}
              >
                <span className={cn("mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border", accountType === a.type ? "border-brand bg-brand text-brand-fg" : "border-border")}>
                  {accountType === a.type ? <Check className="h-3 w-3" /> : null}
                </span>
                <span>
                  <span className="block font-semibold">{a.name}</span>
                  <span className="block text-sm text-muted">{a.desc}</span>
                </span>
              </button>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4 text-sm">
            <div className="max-h-56 overflow-y-auto rounded-xl bg-surface-2 p-4 text-muted">
              <p className="font-semibold text-fg">Allmänna villkor (sammanfattning)</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Spira tillhandahåller depå och konto för handel med finansiella instrument.</li>
                <li>Courtage tas ut enligt gällande prislista. Som ny kund får du courtageklass Start.</li>
                <li>Historisk avkastning är ingen garanti för framtida avkastning. Pengar som placeras kan både öka och minska i värde.</li>
                <li>Uttag och kopplade bankkonton signeras med BankID.</li>
                <li>Detta är en demonstrationstjänst. Ingen riktig handel sker.</li>
              </ul>
            </div>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-0.5" />
              Jag har läst och godkänner de allmänna villkoren och bekräftar att mina uppgifter stämmer.
            </label>
          </div>
        )}

        {error ? (
          <div className="mt-4">
            <Notice kind="error">{error}</Notice>
          </div>
        ) : null}

        <div className="mt-6 flex justify-between">
          <button type="button" className="btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Tillbaka
          </button>
          {step < 3 ? (
            <button
              type="button"
              className="btn-primary"
              disabled={(step === 0 && !contactOk) || (step === 1 && !kycOk)}
              onClick={() => setStep(step + 1)}
            >
              Fortsätt
            </button>
          ) : (
            <button type="button" className="btn-primary" disabled={!accept} onClick={() => setSigning(true)}>
              Skriv under med BankID
            </button>
          )}
        </div>
      </div>

      {signing ? (
        <SignDialog
          request={{ action: "agreement" }}
          title="Skriv under kundavtalet med ditt BankID."
          onClose={() => setSigning(false)}
          onSigned={async (orderRef) => {
            const r = await completeOnboarding(orderRef, { ...contact, accountType, kyc });
            if (r.error) {
              setSigning(false);
              setError(r.error);
              return;
            }
            router.replace(r.redirect!);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
