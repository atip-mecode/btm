"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomActionNavigation } from "@/components/layout/BottomActionNavigation";
import { createPairingResult } from "@/features/matching/actions/pairingActions";
import { PairingResultView } from "@/features/matching/components/PairingResultView";
import { useRooms } from "@/features/matching/hooks/useRooms";
import { computePairingResult } from "@/features/matching/services/computePairingResult";

type PairingResultFlowProps = {
  roomId: string;
};

export function PairingResultFlow({ roomId }: PairingResultFlowProps) {
  const router = useRouter();
  const [isRerolling, setIsRerolling] = useState(false);
  const { rooms, isLoading, error, saveRoom } = useRooms();
  const room = rooms.find((item) => item.id === roomId);
  const canReroll = Boolean(room?.result.prepare);

  async function handleReroll() {
    if (!room?.result.prepare || isRerolling) return;

    setIsRerolling(true);
    const nextRoomId = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const rerolledResult = createPairingResult(room.result.prepare);
    const savedRoom = await saveRoom({ id: nextRoomId, fillin: room.fillin, result: rerolledResult });
    setIsRerolling(false);

    if (savedRoom.success) router.push(`/match/${encodeURIComponent(nextRoomId)}`);
  }

  return (
    <>
      {isLoading ? <p role="status" className="px-4 pt-5 text-sm text-slate-500">กำลังโหลดผลจับคู่…</p> : null}
      {!isLoading && room ? <PairingResultView result={computePairingResult(room.result, room.fillin)} /> : null}
      {!isLoading && !room && !error ? (
        <main className="min-h-0 flex-1 px-4 pt-5">
          <h1 className="text-lg font-semibold text-slate-900">ไม่พบห้องนี้</h1>
          <p className="mt-2 text-sm text-slate-500">ห้องอาจถูกลบ หรือยังไม่ได้บันทึกไว้ในอุปกรณ์นี้</p>
        </main>
      ) : null}
      {error ? <p role="alert" className="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-20 mx-auto w-full max-w-[430px] bg-white px-4 py-2 text-sm text-red-600">{error}</p> : null}
      <BottomActionNavigation
        onBack={() => router.push("/")}
        backLabel="หน้าแรก"
        onNext={handleReroll}
        nextLabel={isRerolling ? "กำลังสุ่ม…" : "สุ่มคู่ใหม่อีกครั้ง"}
        nextDisabled={isLoading || isRerolling || !room || !canReroll}
      />
    </>
  );
}
