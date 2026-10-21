import type { ReactNode } from "react";

export function CleanLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white sm:min-h-0 sm:h-full sm:overflow-y-auto sm:rounded-[32px] sm:border sm:border-slate-200 sm:shadow-[0_24px_72px_rgb(0_0_0/0.18)]">
      {children}
    </div>
  );
}
