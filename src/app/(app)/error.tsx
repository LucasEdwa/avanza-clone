"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card mx-auto mt-10 max-w-md p-8 text-center">
      <h2 className="h2">Något gick fel</h2>
      <p className="mt-2 text-sm text-muted">Ett tekniskt fel uppstod. Försök igen om en stund.</p>
      {error.digest ? <p className="mt-2 font-mono text-xs text-muted">Felkod {error.digest}</p> : null}
      <button className="btn-primary mt-5" onClick={reset}>
        Försök igen
      </button>
    </div>
  );
}
