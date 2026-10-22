"use client";

import Link from "next/link";
import { useRooms } from "@/features/matching/hooks/useRooms";
import { computePairingResult } from "@/features/matching/services/computePairingResult";
import type { MatchRoom } from "@/features/matching/data/roomRepository";
import type { PairingResult } from "@/features/matching/types/pairingResult";

function formatHour(hour: number): string {
  return String(hour % 24).padStart(2, "0") + ":00";
}

function countPlayers(result: PairingResult): number {
  return new Set(result.hours.flatMap((hour) => hour.paired.flatMap((pair) => pair.map((player) => player.id)))).size;
}

function getRoomHref(room: MatchRoom): string {
  return "/match/" + encodeURIComponent(room.id);
}

function RoomCard({ room }: { room: MatchRoom }) {
  const result = computePairingResult(room.result, room.fillin);
  const firstHour = result.hours[0];
  const lastHour = result.hours[result.hours.length - 1];
  const courtNames = Array.from(new Set(result.hours.flatMap((hour) => hour.courts.map((court) => court.courtName))));

  return (
    <Link
      href={getRoomHref(room)}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">
            {firstHour && lastHour
              ? `ห้อง ${formatHour(firstHour.startHour)}–${formatHour(lastHour.endHour)}`
              : "ห้องจับคู่"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {new Intl.DateTimeFormat("th-TH", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Bangkok",
            }).format(new Date(room.createdAt))}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-primary">
          {room.fillin ? "แยกคอร์ด" : "รวมคอร์ด"}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        {courtNames.length} คอร์ด · {countPlayers(room.result)} คน · {result.hours.length} ชม.
      </p>
      {courtNames.length > 0 ? <p className="mt-1 truncate text-xs text-slate-500">{courtNames.join(" · ")}</p> : null}
    </Link>
  );
}

export function RoomList() {
  const { rooms, isLoading, error } = useRooms();

  return (
    <main aria-label="รายการห้อง" className="px-4 pb-8 pt-5">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">ห้องของฉัน</h1>
        <p className="mt-1 text-sm text-slate-500">ผลจับคู่ที่บันทึกไว้ในอุปกรณ์นี้</p>
      </header>
      {isLoading ? <p role="status" className="rounded-2xl bg-white p-4 text-sm text-slate-500">กำลังโหลดห้อง…</p> : null}
      {error ? <p role="alert" className="rounded-2xl bg-white p-4 text-sm text-red-600">{error}</p> : null}
      {!isLoading && !error && rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center">
          <p className="font-semibold text-slate-800">ยังไม่มีห้องที่บันทึกไว้</p>
          <p className="mt-1 text-sm text-slate-500">เริ่มจับคู่เพื่อสร้างห้องแรกของคุณ</p>
          <Link href="/new" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white">
            เริ่มจับคู่
          </Link>
        </div>
      ) : null}
      {rooms.length > 0 ? (
        <div className="space-y-3">
          {rooms.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      ) : null}
    </main>
  );
}
