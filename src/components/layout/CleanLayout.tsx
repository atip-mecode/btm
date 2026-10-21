import type { ReactNode } from "react";

export function CleanLayout({ children }: { children: ReactNode }) {
  return <div className="app-shell clean-shell flex flex-col">{children}</div>;
}
