import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="home-shell relative mx-auto min-h-dvh w-full max-w-[430px] bg-white pb-[calc(64px+env(safe-area-inset-bottom))] sm:min-h-0 sm:h-full sm:overflow-hidden sm:rounded-[32px] sm:border sm:border-slate-200 sm:shadow-[0_24px_72px_rgb(0_0_0/0.18)]">
      <div className="h-full min-h-dvh overflow-y-auto sm:min-h-0">{children}</div>
      <BottomNavigation />
    </div>
  );
}
