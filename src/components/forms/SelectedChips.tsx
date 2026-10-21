"use client";

import { X } from "lucide-react";
import type { SelectOption } from "@/components/forms/MultiSelectField";

type SelectedChipsProps<T extends SelectOption> = {
  label: string;
  items: T[];
  onRemove: (id: string) => void;
  formatItemLabel?: (item: T) => string;
};

export function SelectedChips<T extends SelectOption>({ label, items, onRemove, formatItemLabel = (item) => item.name }: SelectedChipsProps<T>) {
  return (
    <section aria-live="polite" className="space-y-2">
      <h2 className="text-sm font-semibold text-slate-800">{label} ({items.length})</h2>
      {items.length ? (
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item.id} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-sky-100 bg-white py-1 pl-3 pr-1.5 text-sm text-slate-700 shadow-sm">
              {formatItemLabel(item)}
              <button type="button" aria-label={`นำ ${formatItemLabel(item)} ออกจากรายการที่เลือก`} onClick={() => onRemove(item.id)} className="flex size-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X aria-hidden="true" size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">ยังไม่ได้เลือก</p>
      )}
    </section>
  );
}
