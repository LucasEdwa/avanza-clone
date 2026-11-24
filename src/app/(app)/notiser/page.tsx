import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { Card, Empty, PageHeader } from "@/components/ui";
import { dateTimeSv } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MarkAllRead } from "./mark-all";

export const metadata = { title: "Notiser" };

export default async function Notifications() {
  const user = await requireUser();
  const rows = await db.select().from(schema.notifications).where(eq(schema.notifications.userId, user.id)).orderBy(desc(schema.notifications.createdAt)).limit(200);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notiser" actions={<MarkAllRead />} />
      <Card>
        {rows.length === 0 ? (
          <Empty title="Inga notiser" />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((n) => (
              <li key={n.id} className={cn("px-5 py-4", !n.readAt && "bg-brand-soft/40")}>
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{n.link ? <Link href={n.link} className="hover:text-brand">{n.title}</Link> : n.title}</span>
                  <span className="text-xs whitespace-nowrap text-muted">{dateTimeSv(n.createdAt)}</span>
                </div>
                {n.body ? <p className="mt-0.5 text-sm text-muted">{n.body}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
