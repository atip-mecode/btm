"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { MultiSelectField } from "@/components/forms/MultiSelectField";
import { createSuggestedCourtName, type AddCourtData, type CourtActionErrorCode } from "@/features/courts/actions/courtActions";
import type { Court } from "@/features/courts/data/courtRepository";
import type { ActionResult } from "@/lib/actionResult";

type CourtFormProps = {
  courts: Court[];
  selectedCourtIds: string[];
  startHour: string;
  isLoading: boolean;
  error: string | null;
  onStartHourChange: (hour: string) => void;
  toggleCourt: (id: string) => Promise<ActionResult<string[], CourtActionErrorCode>>;
  addCourt: (input: { name: string; hours: number }) => Promise<ActionResult<AddCourtData, CourtActionErrorCode>>;
};

export function CourtForm({ courts, selectedCourtIds, startHour, isLoading, error, onStartHourChange, toggleCourt, addCourt }: CourtFormProps) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [courtName, setCourtName] = useState(createSuggestedCourtName);
  const [hours, setHours] = useState("1");

  async function handleAddCourt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await addCourt({ name: courtName, hours: Number(hours) });
    if (!result.success) return;
    setIsAddFormOpen(false);
    setCourtName(createSuggestedCourtName());
    setHours("1");
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="start-hour" className="text-sm font-semibold text-slate-800">เวลาเริ่มตี</label>
        <div className="relative">
          <select
            id="start-hour"
            value={startHour}
            onChange={(event) => onStartHourChange(event.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            <option value="">เลือกเวลาเริ่มตี</option>
            {Array.from({ length: 24 }, (_, hour) => {
              const value = String(hour).padStart(2, "0");
              return <option key={value} value={value}>{value}:00</option>;
            })}
          </select>
          <ChevronDown aria-hidden="true" size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      <h2 className="text-base font-semibold text-slate-900">Court</h2>
      <MultiSelectField
        id="court-select"
        label="เลือกคอร์ด"
        placeholder="เลือกคอร์ดได้หลายคอร์ด"
        emptyMessage="ยังไม่มีคอร์ด เพิ่มคอร์ดใหม่ได้เลย"
        options={courts}
        selectedIds={selectedCourtIds}
        isLoading={isLoading}
        onToggle={(id) => void toggleCourt(id)}
      />
      <button type="button" onClick={() => setIsAddFormOpen((open) => !open)} className="flex min-h-12 w-full items-center justify-end gap-2 rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-sky-50 active:bg-sky-100">
        <Plus aria-hidden="true" size={17} /> {isAddFormOpen ? "ปิดฟอร์มเพิ่มคอร์ด" : "เพิ่มคอร์ดใหม่"}
      </button>
      {isAddFormOpen ? (
        <form onSubmit={handleAddCourt} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <label htmlFor="new-court-name" className="text-sm font-semibold text-slate-800">ชื่อคอร์ด</label>
            <input id="new-court-name" type="text" autoComplete="off" maxLength={80} value={courtName} onChange={(event) => setCourtName(event.target.value)} placeholder="ชื่อคอร์ด" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
            <p className="text-xs text-slate-500">แก้ชื่อที่สุ่มให้ได้ หรือเว้นว่างไว้เพื่อสุ่มชื่อใหม่</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="court-hours" className="text-sm font-semibold text-slate-800">จำนวนชั่วโมง</label>
            <input id="court-hours" type="number" inputMode="numeric" min={1} step={1} value={hours} onChange={(event) => setHours(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100" />
          </div>
          <button type="submit" disabled={isLoading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45">
            <Plus aria-hidden="true" size={17} /> บันทึกคอร์ด
          </button>
        </form>
      ) : null}
      {error ? <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
