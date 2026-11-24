import { requireUser } from "@/lib/auth";
import { moneyData } from "@/lib/money-data";
import { MinEkonomiTabs } from "@/components/min-ekonomi-tabs";
import { MoneyTabs } from "@/components/money/money-tabs";
import { DepositForm } from "@/components/money/money-forms";

export const metadata = { title: "Sätt in pengar" };

export default async function Page({ searchParams }: PageProps<"/min-ekonomi/insattning">) {
  const sp = await searchParams;
  void sp;
  const user = await requireUser();
  const data = await moneyData(user.id);
  return (
    <div>
      <MinEkonomiTabs active="insattning" />
      <div className="mx-auto max-w-lg">
        <MoneyTabs active="in" />
        <div className="card p-6">
          <h1 className="h2 mb-4">Sätt in pengar</h1>
          <DepositForm data={data} initialAccount={typeof sp.konto === "string" ? sp.konto : undefined} />
        </div>
      </div>
    </div>
  );
}
