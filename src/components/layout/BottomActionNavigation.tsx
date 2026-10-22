"use client";

import { useRouter } from "next/navigation";

type BottomActionNavigationProps = {
  onNext?: () => void;
  onBack?: () => void;
  showNext?: boolean;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
};

export function BottomActionNavigation({ onNext, onBack, showNext = false, backLabel = "ย้อนกลับ", nextLabel = "ต่อไป", nextDisabled = false }: BottomActionNavigationProps) {
  const router = useRouter();

  return (
    <nav aria-label="การทำรายการ" className="fixed inset-x-0 bottom-0 z-30 mx-auto flex h-[calc(68px+env(safe-area-inset-bottom))] w-full max-w-[430px] items-center gap-3 border-t border-slate-100 bg-white/95 px-4 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:absolute sm:max-w-none">
      <button
        type="button"
        onClick={onBack ?? (() => router.back())}
        className="flex min-h-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200"
      >{backLabel}</button>
      {onNext || showNext ? (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || !onNext}
          className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {nextLabel}
        </button>
      ) : null}
    </nav>
  );
}
