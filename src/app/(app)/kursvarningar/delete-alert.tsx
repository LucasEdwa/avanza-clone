"use client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteAlert } from "@/app/actions/watch";

export function DeleteAlert({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      className="btn-ghost px-2 py-1 text-neg"
      aria-label="Ta bort"
      onClick={async () => {
        await deleteAlert(id);
        router.refresh();
      }}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
