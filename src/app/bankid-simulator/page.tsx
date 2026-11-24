import { notFound } from "next/navigation";
import { Simulator } from "./simulator";

export const metadata = { title: "BankID-simulator (test)" };

export default async function Page({ searchParams }: PageProps<"/bankid-simulator">) {
  if ((process.env.BANKID_MODE ?? "simulator") !== "simulator") notFound();
  const sp = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1b22] p-4">
      <Simulator autoStartToken={typeof sp.autostarttoken === "string" ? sp.autostarttoken : undefined} />
    </div>
  );
}
