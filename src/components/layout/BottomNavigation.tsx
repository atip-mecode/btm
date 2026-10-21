"use client";

import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";

const matchOptions = ["แยกคอร์ด", "รวมคอร์ด"] as const;

export function BottomNavigation() {
  const [optionsOpen, setOptionsOpen] = useState(false);

  useEffect(() => {
    if (!optionsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOptionsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [optionsOpen]);

  return (
    <>
      {optionsOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/25 px-3 pb-[calc(68px+env(safe-area-inset-bottom))] sm:absolute sm:rounded-[32px]">
          <button
            aria-label="ปิดตัวเลือก"
            className="absolute inset-0 size-full cursor-default"
            onClick={() => setOptionsOpen(false)}
          />
          <section
            aria-labelledby="match-options-title"
            aria-modal="true"
            className="relative z-10 w-full max-w-[410px] rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_16px_48px_rgb(15_23_42/0.16)]"
            role="dialog"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="match-options-title" className="text-base font-semibold text-slate-900">เลือกวิธีจับคู่</h2>
              <button
                aria-label="ปิดตัวเลือก"
                onClick={() => setOptionsOpen(false)}
                className="flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
              >
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {matchOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setOptionsOpen(false)}
                  className="flex min-h-[76px] items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 px-3 text-sm font-semibold text-slate-800 transition-colors hover:border-sky-300 hover:bg-sky-100 active:scale-[0.98]"
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
      <nav aria-label="เมนูหลัก" className="fixed inset-x-0 bottom-0 z-30 h-[52px] border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:absolute sm:rounded-b-[31px]">
        <button
          type="button"
          aria-label="เปิดตัวเลือกจับคู่"
          aria-expanded={optionsOpen}
          aria-haspopup="dialog"
          onClick={() => setOptionsOpen(true)}
          className="absolute left-1/2 top-1/2 flex size-[58px] -translate-x-1/2 -translate-y-[72%] items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_20px_rgb(48_153_218/0.32)] ring-4 ring-white transition-transform active:scale-95"
        >
          <Heart aria-hidden="true" size={25} strokeWidth={2.2} />
        </button>
      </nav>
    </>
  );
}
