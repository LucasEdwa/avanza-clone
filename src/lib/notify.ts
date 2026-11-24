import { db, schema, type Tx } from "@/db";

export async function notify(
  userId: string,
  n: { kind: string; title: string; body?: string; link?: string },
  tx: Tx | typeof db = db,
) {
  await tx.insert(schema.notifications).values({ userId, ...n });
}
