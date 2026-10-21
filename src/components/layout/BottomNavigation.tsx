"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";

export function BottomNavigation() {
  const pathname = usePathname();
  const active = pathname === "/match";

  return (
    <nav aria-label="เมนูหลัก" className="fixed inset-x-0 bottom-0 z-30 h-[52px] border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:absolute sm:rounded-b-[31px]">
      <Link
        href="/match"
        aria-label="จับคู่"
        aria-current={active ? "page" : undefined}
        className="absolute left-1/2 top-1/2 flex size-[58px] -translate-x-1/2 -translate-y-[72%] items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_20px_rgb(48_153_218/0.32)] ring-4 ring-white transition-transform active:scale-95"
      >
        <Heart aria-hidden="true" size={25} strokeWidth={2.2} />
      </Link>
    </nav>
  );
}
