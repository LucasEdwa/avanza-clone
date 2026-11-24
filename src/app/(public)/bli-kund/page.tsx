import { redirect } from "next/navigation";
import { getOnboarding } from "@/lib/signed-cookie";
import { formatPersonnummer } from "@/lib/personnummer";
import { OnboardingWizard } from "./wizard";

export const metadata = { title: "Bli kund" };

export default async function BecomeCustomer() {
  const ob = await getOnboarding();
  if (!ob) redirect("/logga-in?ny=1");
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="h1">Välkommen, {ob.givenName}!</h1>
      <p className="mt-1 text-sm text-muted">
        Du har identifierat dig som {ob.givenName} {ob.surname} ({formatPersonnummer(ob.pnr)}). Det tar bara några minuter att bli kund.
      </p>
      <OnboardingWizard />
    </div>
  );
}
