import { requireUser } from "@/lib/auth";
import { iskTax, realizedGains } from "@/lib/tax";
import { Card, Empty, Notice } from "@/components/ui";
import { MinEkonomiTabs } from "@/components/min-ekonomi-tabs";
import { dateSv, num, price, sek, trendClass } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Skatt & deklaration" };

export default async function Tax() {
  const user = await requireUser();
  const [isk, k4] = await Promise.all([iskTax(user.id), realizedGains(user.id)]);
  return (
    <div>
      <MinEkonomiTabs active="skatt" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title={`Schablonskatt ISK & KF ${isk?.year ?? ""}`} className="pb-5">
          {!isk ? (
            <Empty title="Du har inget ISK eller KF" />
          ) : (
            <div className="space-y-4 px-5 pt-3 text-sm">
              <table className="w-full">
                <tbody>
                  {isk.quarters.map((q) => (
                    <tr key={q.label}>
                      <td className="py-1 text-muted">Värde {q.label}</td>
                      <td className="py-1 text-right tabular-nums">
                        {sek(q.value, 0)}
                        {q.estimated ? <span className="ml-1 text-xs text-muted">(prognos)</span> : null}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-1 text-muted">Insättningar under året</td>
                    <td className="py-1 text-right tabular-nums">{sek(isk.depositSum, 0)}</td>
                  </tr>
                  <tr className="border-t border-border font-medium">
                    <td className="py-1.5">Kapitalunderlag (summa / 4)</td>
                    <td className="py-1.5 text-right tabular-nums">{sek(isk.capitalBase, 0)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-muted">Skattefritt grundbelopp</td>
                    <td className="py-1 text-right tabular-nums">−{sek(isk.taxFree, 0)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-muted">Schablonränta</td>
                    <td className="py-1 text-right tabular-nums">{num(isk.rate, 2)} %</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-muted">Schablonintäkt</td>
                    <td className="py-1 text-right tabular-nums">{sek(isk.income, 0)}</td>
                  </tr>
                  <tr className="border-t border-border text-base font-semibold">
                    <td className="py-2">Beräknad skatt (30 %)</td>
                    <td className="py-2 text-right tabular-nums">{sek(isk.tax, 0)}</td>
                  </tr>
                </tbody>
              </table>
              <Notice>
                Beräkningen är en uppskattning. Skatten för ISK dras via din deklaration, för KF tas avkastningsskatten ut kvartalsvis.
                {isk.estimatedParams ? " Statslåneräntan för året är preliminär." : ""}
              </Notice>
            </div>
          )}
        </Card>
        <Card title="Deklarationsunderlag K4 (Aktie- & fondkonto)" className="pb-5">
          {!k4.length ? (
            <Empty title="Inga avyttringar på AF-konto" />
          ) : (
            <div className="space-y-6 px-5 pt-3">
              {k4.map((y) => (
                <div key={y.year}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <h3 className="font-semibold">Inkomstår {y.year}</h3>
                    <span className={cn("text-sm font-semibold", trendClass(y.net))}>Netto {sek(y.net, 0)}</span>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Datum</th>
                        <th>Värdepapper</th>
                        <th className="num">Antal</th>
                        <th className="num">Kurs</th>
                        <th className="num">Vinst/förlust</th>
                      </tr>
                    </thead>
                    <tbody>
                      {y.list.map(({ t, i }) => (
                        <tr key={t.id}>
                          <td className="text-muted">{dateSv(t.bookedAt)}</td>
                          <td>{i.name}</td>
                          <td className="num">{num(t.quantity, 0, 4)}</td>
                          <td className="num">{price(t.price)}</td>
                          <td className={cn("num", trendClass(t.realizedGain))}>{sek(t.realizedGain, 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted">Summa vinster</div>
                      <div className="font-medium">{sek(y.gains, 0)}</div>
                    </div>
                    <div>
                      <div className="text-muted">Summa förluster</div>
                      <div className="font-medium">{sek(y.losses, 0)}</div>
                    </div>
                    <div>
                      <div className="text-muted">{y.tax >= 0 ? "Beräknad skatt (30 %)" : "Skattereduktion (70 % × 30 %)"}</div>
                      <div className="font-medium">{sek(Math.abs(y.tax), 0)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
