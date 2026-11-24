import { NextResponse } from "next/server";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ items: [], unread: 0 }, { status: 401 });
  const items = await db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, user.id))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(20);
  const [{ c }] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(schema.notifications)
    .where(and(eq(schema.notifications.userId, user.id), isNull(schema.notifications.readAt)));
  return NextResponse.json({ items, unread: c }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({}, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  await db
    .update(schema.notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(schema.notifications.userId, user.id),
        isNull(schema.notifications.readAt),
        id ? eq(schema.notifications.id, id) : undefined,
      ),
    );
  return NextResponse.json({ ok: true });
}
