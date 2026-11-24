"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { createWatchlist, deleteWatchlist, renameWatchlist, toggleWatch } from "@/app/actions/watch";

export function WatchlistControls({ list }: { list?: { id: string; name: string } }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "edit">("idle");
  const [name, setName] = useState(list?.name ?? "");
  const [, start] = useTransition();
  if (mode === "edit")
    return (
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            if (list) await renameWatchlist(list.id, name);
            else await createWatchlist(name);
            setMode("idle");
            if (!list) setName("");
            router.refresh();
          });
        }}
      >
        <input autoFocus className="input py-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="Namn på listan" maxLength={40} />
        <button className="btn-primary py-1.5">Spara</button>
        <button type="button" className="btn-ghost px-2" onClick={() => setMode("idle")}>
          <X className="h-4 w-4" />
        </button>
      </form>
    );
  if (!list)
    return (
      <button className="btn-primary" onClick={() => setMode("edit")}>
        <Plus className="h-4 w-4" /> Ny lista
      </button>
    );
  return (
    <div className="flex gap-1">
      <button className="btn-ghost px-2 py-1" onClick={() => setMode("edit")} aria-label="Byt namn">
        <Pencil className="h-4 w-4" />
      </button>
      <button
        className="btn-ghost px-2 py-1 text-neg"
        aria-label="Ta bort lista"
        onClick={() =>
          confirm(`Ta bort listan "${list.name}"?`) &&
          start(async () => {
            await deleteWatchlist(list.id);
            router.refresh();
          })
        }
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function RemoveFromList({ listId, instrumentId, name }: { listId: string; instrumentId: number; name: string }) {
  const router = useRouter();
  const [, start] = useTransition();
  return (
    <button
      className="chip gap-1"
      onClick={() =>
        start(async () => {
          await toggleWatch(listId, instrumentId, false);
          router.refresh();
        })
      }
    >
      {name} <X className="h-3 w-3" />
    </button>
  );
}
