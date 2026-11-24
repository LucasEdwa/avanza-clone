import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { LoginBox } from "./login-box";
import { Notice } from "@/components/ui";

export const metadata = { title: "Logga in" };

export default async function LoginPage({ searchParams }: PageProps<"/logga-in">) {
  const sp = await searchParams;
  if (await getUser()) redirect("/min-ekonomi/oversikt");
  const next = typeof sp.next === "string" ? sp.next : undefined;
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
      {sp.utloggad ? <Notice kind="info">Du har blivit utloggad. Logga in igen för att fortsätta.</Notice> : null}
      <div className="card p-6">
        <h1 className="mb-1 text-center text-2xl font-bold">{sp.ny ? "Bli kund" : "Logga in"}</h1>
        <p className="mb-6 text-center text-sm text-muted">
          {sp.ny ? "Börja med att identifiera dig med BankID." : "Identifiera dig med BankID."}
        </p>
        <LoginBox next={next} />
      </div>
      {(process.env.BANKID_MODE ?? "simulator") === "simulator" ? (
        <Notice kind="warn">
          <b>Testläge.</b> Öppna{" "}
          <a href="/bankid-simulator" target="bankid-sim" className="underline">
            BankID-simulatorn
          </a>{" "}
          i ett annat fönster eller på mobilen. Demokund: <b>19900315-2387</b> (Anna Lindqvist). Ange ett annat
          giltigt personnummer för att bli ny kund.
        </Notice>
      ) : null}
    </div>
  );
}
