"use client";

import { useRouter } from "next/navigation";

export function BottomActionNavigation() {
  const router = useRouter();

  return (
    <nav aria-label="การทำรายการ" className="fixed inset-x-0 bottom-0 z-30 mx-auto flex h-[calc(68px+env(safe-area-inset-bottom))] w-full max-w-[430px] items-center justify-between gap-3 border-t border-slate-100 bg-white/95 px-4 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:absolute sm:max-w-none">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex min-h-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200"
      >ย้อนกลับ</button>
      <button
        type="button"
        className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
      >
        ยืนยัน
      </button>
    </nav>
  );
}
