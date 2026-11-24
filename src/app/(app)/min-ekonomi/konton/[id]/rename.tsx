"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { renameAccount } from "@/app/actions/money";

export function RenameAccount({ id, name }: { id: string; name: string }) {
  const [edit, setEdit] = useState(false);
  const [v, setV] = useState(name);
  const router = useRouter();
  if (!edit)
    return (
      <span className="inline-flex items-center gap-2">
        {name}
        <button onClick={() => setEdit(true)} className="rounded-full p-1 text-muted hover:bg-surface-2" aria-label="Byt namn">
          <Pencil className="h-4 w-4" />
        </button>
      </span>
    );
  return (
    <form
      className="inline-flex items-center gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await renameAccount(id, v);
        setEdit(false);
        router.refresh();
      }}
    >
      <input autoFocus className="input text-xl font-bold" value={v} onChange={(e) => setV(e.target.value)} maxLength={40} />
      <button className="btn-primary">Spara</button>
    </form>
  );
}
