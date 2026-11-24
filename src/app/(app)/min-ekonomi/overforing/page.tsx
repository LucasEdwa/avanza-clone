import { requireUser } from "@/lib/auth";
import { moneyData } from "@/lib/money-data";
import { MinEkonomiTabs } from "@/components/min-ekonomi-tabs";
import { MoneyTabs } from "@/components/money/money-tabs";
import { TransferForm } from "@/components/money/money-forms";

export const metadata = { title: "Överför mellan egna konton" };

export default async function Page({ searchParams }: PageProps<"/min-ekonomi/overforing">) {
  const sp = await searchParams;
  void sp;
  const user = await requireUser();
  const data = await moneyData(user.id);
  return (
    <div>
      <MinEkonomiTabs active="insattning" />
      <div className="mx-auto max-w-lg">
        <MoneyTabs active="transfer" />
        <div className="card p-6">
          <h1 className="h2 mb-4">Överför mellan egna konton</h1>
          <TransferForm data={data} />
        </div>
      </div>
    </div>
  );
}
