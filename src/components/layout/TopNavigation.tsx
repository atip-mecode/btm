"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function TopNavigation() {
  const router = useRouter();

  return (
    <header className="flex h-14 items-center px-4 pt-[env(safe-area-inset-top)]">
      <button
        type="button"
        aria-label="ย้อนกลับ"
        onClick={() => router.back()}
        className="flex size-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 active:bg-slate-200"
      >
        <ArrowLeft aria-hidden="true" size={21} strokeWidth={1.9} />
      </button>
    </header>
  );
}
