"use client";

import { KYC_QUESTIONS } from "@/lib/kyc";
import { cn } from "@/lib/utils";

export function KycForm({
  value,
  onChange,
}: {
  value: Record<string, string | string[]>;
  onChange: (v: Record<string, string | string[]>) => void;
}) {
  return (
    <div className="space-y-5">
      {KYC_QUESTIONS.map((q) => (
        <fieldset key={q.id}>
          <legend className="mb-2 text-sm font-medium">{q.label}</legend>
          <div className="flex flex-wrap gap-2">
            {q.options.map((o) => {
              const cur = value[q.id];
              const active = q.multi ? Array.isArray(cur) && cur.includes(o) : cur === o;
              return (
                <button
                  type="button"
                  key={o}
                  onClick={() => {
                    if (q.multi) {
                      const arr = Array.isArray(cur) ? cur : [];
                      onChange({ ...value, [q.id]: active ? arr.filter((x) => x !== o) : [...arr, o] });
                    } else onChange({ ...value, [q.id]: o });
                  }}
                  className={cn("chip py-1.5 text-sm", active && "chip-active")}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
