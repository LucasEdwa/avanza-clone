"use client";
import { useRouter } from "next/navigation";

export function MarkAllRead() {
  const router = useRouter();
  return (
    <button
      className="btn-secondary"
      onClick={async () => {
        await fetch("/api/notifications", { method: "POST", body: "{}" });
        router.refresh();
      }}
    >
      Markera alla som lästa
    </button>
  );
}
