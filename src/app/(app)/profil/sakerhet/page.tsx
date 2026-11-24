import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession, requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { dateTimeSv } from "@/lib/format";
import { logoutEverywhere } from "@/app/actions/session";

export const metadata = { title: "Säkerhet" };

function device(ua: string | null) {
  if (!ua) return "Okänd enhet";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Okänt OS";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : ua.split("/")[0];
  return `${br} på ${os}`;
}

export default async function Security() {
  const user = await requireUser();
  const current = await getSession();
  const sessions = await db.select().from(schema.sessions).where(eq(schema.sessions.userId, user.id)).orderBy(desc(schema.sessions.lastSeenAt));
  const logins = await db.select().from(schema.loginEvents).where(eq(schema.loginEvents.userId, user.id)).orderBy(desc(schema.loginEvents.createdAt)).limit(25);
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader back={{ href: "/profil", label: "Profil" }} title="Säkerhet" subtitle={`Du loggas ut automatiskt efter ${process.env.SESSION_IDLE_MINUTES ?? 30} minuters inaktivitet.`} />
      <Card title="Aktiva sessioner" action={<form action={logoutEverywhere}><button className="btn-secondary text-neg">Logga ut överallt</button></form>} className="mb-5">
        <ul className="divide-y divide-border px-5 pb-2 text-sm">
          {sessions.map((s) => (
            <li key={s.id} className="flex justify-between py-3">
              <span>
                {device(s.userAgent)} {s.id === current?.sessionId ? <span className="badge ml-1 bg-pos-soft text-pos">Denna enhet</span> : null}
                <span className="block text-xs text-muted">IP {s.ip}</span>
              </span>
              <span className="text-right text-xs text-muted">
                Inloggad {dateTimeSv(s.createdAt)}
                <br />
                Senast aktiv {dateTimeSv(s.lastSeenAt)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Inloggningshistorik">
        <div className="overflow-x-auto pt-2">
          <table className="table">
            <thead>
              <tr>
                <th>Tidpunkt</th>
                <th>Metod</th>
                <th>Enhet</th>
                <th>IP-adress</th>
              </tr>
            </thead>
            <tbody>
              {logins.map((l) => (
                <tr key={l.id}>
                  <td>{dateTimeSv(l.createdAt)}</td>
                  <td>{l.method}</td>
                  <td className="text-muted">{device(l.userAgent)}</td>
                  <td className="text-muted">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
