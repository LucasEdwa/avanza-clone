import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";

const inflight = new Map<string, Promise<unknown>>();

/** Read-through JSON cache stored in Postgres. Serves stale data if the fetch fails. */
export async function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T | null> {
  const [row] = await db.select().from(schema.marketCache).where(eq(schema.marketCache.key, key));
  if (row && Date.now() - row.fetchedAt.getTime() < ttlMs) return row.data as T;
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;
  const p = (async () => {
    try {
      const data = await fetcher();
      await db
        .insert(schema.marketCache)
        .values({ key, data: data as object, fetchedAt: new Date() })
        .onConflictDoUpdate({ target: schema.marketCache.key, set: { data: data as object, fetchedAt: sql`now()` } });
      return data;
    } catch (e) {
      console.warn(`[market-cache] ${key} failed:`, (e as Error).message);
      return (row?.data as T) ?? null;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}
