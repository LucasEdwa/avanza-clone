import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { formatPersonnummer } from "@/lib/personnummer";
import { dateSv, sek } from "@/lib/format";
import { COURTAGE_CLASSES, START_CLASS_LIMIT_SEK } from "@/lib/courtage";
import { ContactForm, CourtagePicker, ThemePicker } from "./profile-forms";
import { logout } from "@/app/actions/session";

export const metadata = { title: "Profil" };

export default async function Profile() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={`${user.firstName} ${user.lastName}`} subtitle={`Personnummer ${formatPersonnummer(user.personalNumber)} · Kund sedan ${dateSv(user.createdAt)}`} />
      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Kontaktuppgifter" className="pb-5">
          <div className="px-5 pt-3">
            <ContactForm initial={{ email: user.email ?? "", phone: user.phone ?? "", street: user.street ?? "", postalCode: user.postalCode ?? "", city: user.city ?? "" }} />
          </div>
        </Card>
        <div className="space-y-5">
          <Card title="Inställningar" className="pb-2">
            <ul className="divide-y divide-border px-5 pt-1 text-sm">
              {[
                ["/profil/bankkonton", "Kopplade bankkonton"],
                ["/profil/kundkannedom", `Kundkännedom${user.kycCompletedAt ? ` · uppdaterad ${dateSv(user.kycCompletedAt)}` : ""}`],
                ["/profil/sakerhet", "Säkerhet, sessioner & inloggningshistorik"],
                ["/kursvarningar", "Kursvarningar"],
                ["/notiser", "Notiser"],
              ].map(([h, l]) => (
                <li key={h}>
                  <Link href={h} className="flex items-center justify-between py-3 hover:text-brand">
                    {l} <ChevronRight className="h-4 w-4 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Utseende" className="pb-5">
            <div className="px-5 pt-3">
              <ThemePicker current={user.theme as "light" | "dark" | "system"} />
            </div>
          </Card>
        </div>
        <Card title="Courtageklass" className="pb-5 md:col-span-2">
          <div className="px-5 pt-3">
            <p className="mb-3 text-sm text-muted">
              Nuvarande klass: <b className="text-fg">{COURTAGE_CLASSES[user.courtageClass].label}</b>. Handlad volym totalt: {sek(user.tradedVolumeSek, 0)}
              {user.courtageClass === "START" ? ` (Start gäller upp till ${sek(START_CLASS_LIMIT_SEK, 0)})` : ""}. Byte gäller från nästa affär.
            </p>
            <CourtagePicker current={user.courtageClass} />
          </div>
        </Card>
      </div>
      <form action={async () => { "use server"; await logout(); }} className="mt-6 md:hidden">
        <button className="btn-secondary w-full text-neg">Logga ut</button>
      </form>
    </div>
  );
}
