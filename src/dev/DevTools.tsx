"use client";

import { useEffect, useState } from "react";
import { Bug, X } from "lucide-react";

const storageKey = "bmt.devToolsOpen";
const frameStorageKey = "bmt.showPhoneFrame";

export function DevTools() {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const [phoneFrame, setPhoneFrame] = useState(true);

  useEffect(() => {
    setOpen(window.localStorage.getItem(storageKey) === "true");
    setPhoneFrame(window.localStorage.getItem(frameStorageKey) !== "false");
    const updateWidth = () => setWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function toggle(value: boolean) {
    setOpen(value);
    window.localStorage.setItem(storageKey, String(value));
  }

  useEffect(() => {
    document.documentElement.dataset.phoneFrame = String(phoneFrame);
    window.localStorage.setItem(frameStorageKey, String(phoneFrame));
  }, [phoneFrame]);

  if (!open) {
    return (
      <button
        aria-label="Open dev tools"
        onClick={() => toggle(true)}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex size-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
      >
        <Bug aria-hidden="true" size={19} />
      </button>
    );
  }

  return (
    <aside className="fixed inset-x-0 bottom-0 z-50 max-h-[min(55vh,28rem)] overflow-y-auto rounded-t-2xl border border-neutral-200 bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgb(0_0_0/0.16)] sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-80 sm:rounded-2xl sm:pb-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">BMT Dev Tools</p>
          <p className="mt-0.5 text-xs text-neutral-500">Development only</p>
        </div>
        <button aria-label="Close dev tools" onClick={() => toggle(false)} className="flex size-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100">
          <X aria-hidden="true" size={18} />
        </button>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-neutral-50 p-3">
          <dt className="text-xs text-neutral-500">Viewport</dt>
          <dd className="mt-1 font-medium tabular-nums">{width === null ? "—" : `${width} px`}</dd>
        </div>
        <div className="rounded-xl bg-neutral-50 p-3">
          <dt className="text-xs text-neutral-500">Breakpoint</dt>
          <dd className="mt-1 font-medium">{width === null ? "—" : width < 640 ? "Mobile" : width < 1024 ? "Tablet" : "Desktop"}</dd>
        </div>
      </dl>
      <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 px-3 text-sm">
        <input type="checkbox" checked={phoneFrame} onChange={(event) => setPhoneFrame(event.target.checked)} className="size-4 accent-neutral-900" />
        <span>Show phone frame (390 × 844)</span>
      </label>
      <p className="mt-3 text-xs leading-5 text-neutral-500">กรอบจำลองแสดงเฉพาะตอนพัฒนา ปิดเพื่อดู responsive layout เต็มหน้าจอ</p>
    </aside>
  );
}
