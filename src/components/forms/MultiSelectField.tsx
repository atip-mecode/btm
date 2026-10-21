"use client";

import { Check, ChevronDown } from "lucide-react";

export type SelectOption = { id: string; name: string };

type MultiSelectFieldProps<T extends SelectOption> = {
  id: string;
  label: string;
  placeholder: string;
  emptyMessage: string;
  options: T[];
  selectedIds: string[];
  isLoading: boolean;
  onToggle: (id: string) => void;
};

export function MultiSelectField<T extends SelectOption>({
  id,
  label,
  placeholder,
  emptyMessage,
  options,
  selectedIds,
  isLoading,
  onToggle,
}: MultiSelectFieldProps<T>) {
  return (
    <section className="space-y-2">
      <p id={`${id}-label`} className="text-sm font-semibold text-slate-800">{label}</p>
      <details className="group relative">
        <summary id={id} aria-labelledby={`${id}-label`} aria-haspopup="listbox" className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-left text-sm shadow-sm outline-none transition focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-100 [&::-webkit-details-marker]:hidden">
          <span className="truncate text-slate-700">
            {isLoading ? "กำลังโหลด…" : selectedIds.length ? `เลือกแล้ว ${selectedIds.length} รายการ` : placeholder}
          </span>
          <ChevronDown aria-hidden="true" size={18} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {options.length ? (
            <div aria-label={label} role="listbox" aria-multiselectable="true" className="max-h-56 overflow-y-auto p-1.5">
              {options.map((option) => {
                const selected = selectedIds.includes(option.id);
                return (
                  <button key={option.id} type="button" role="option" aria-selected={selected} onClick={() => onToggle(option.id)} className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                    <span>{option.name}</span>
                    {selected ? <Check aria-hidden="true" size={17} className="text-primary" /> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-4 text-sm text-slate-500">{emptyMessage}</p>
          )}
        </div>
      </details>
    </section>
  );
}
