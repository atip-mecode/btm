import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell home-shell flex flex-col pb-[calc(64px+env(safe-area-inset-bottom))]">
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      <BottomNavigation />
    </div>
  );
}
