import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { KycEditor } from "./kyc-editor";

export const metadata = { title: "Kundkännedom" };

export default async function KycPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader back={{ href: "/profil", label: "Profil" }} title="Kundkännedom" subtitle="Vi är enligt lag skyldiga att hålla dina uppgifter aktuella. Uppdatera om något har ändrats." />
      <div className="card p-6">
        <KycEditor initial={user.kyc ?? {}} />
      </div>
    </div>
  );
}
