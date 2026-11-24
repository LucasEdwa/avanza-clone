export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.DISABLE_TICKER === "1") return;
  const { runTick } = await import("./lib/ticker");
  const g = globalThis as unknown as { __spiraTicker?: NodeJS.Timeout };
  if (g.__spiraTicker) return;
  // Background order matcher / alerts / monthly savings – every 30 seconds.
  g.__spiraTicker = setInterval(() => {
    runTick().catch((e) => console.error("[ticker]", (e as Error).message));
  }, 30_000);
}
