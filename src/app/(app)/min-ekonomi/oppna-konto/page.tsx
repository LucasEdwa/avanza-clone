import { PageHeader } from "@/components/ui";
import { OpenAccount } from "./open-account";

export const metadata = { title: "Öppna konto" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader back={{ href: "/min-ekonomi/oversikt", label: "Översikt" }} title="Öppna konto" subtitle="Välj kontotyp. Kontot öppnas direkt efter att du skrivit under med BankID." />
      <OpenAccount />
    </div>
  );
}
