"use client";

import { useRouter } from "next/navigation";
import { BottomActionNavigation } from "@/components/layout/BottomActionNavigation";
import { useCourts } from "@/features/courts/hooks/useCourts";
import { calculateCourtEndTime, formatHour } from "@/features/courts/utils/courtSchedule";

type PrepareCourtsFlowProps = {
  startHour: number | null;
  selectedCourtIds: string[];
  matchType: string;
};

export function PrepareCourtsFlow({ startHour, selectedCourtIds, matchType }: PrepareCourtsFlowProps) {
  const router = useRouter();
  const { courts, isLoading } = useCourts();
  const courtsById = new Map(courts.map((court) => [court.id, court]));
  const selectedCourts = selectedCourtIds.flatMap((id) => {
    const court = courtsById.get(id);
    return court ? [court] : [];
  });

  function handleBack() {
    const params = new URLSearchParams({ type: matchType });
    if (startHour !== null) params.set("start", String(startHour).padStart(2, "0"));
    router.push(`/new?${params.toString()}`);
  }

  return (
    <>
      <main aria-label="เตรียมคอร์ด" className="min-h-0 flex-1 overflow-y-auto pb-[calc(84px+env(safe-area-inset-bottom))]">
        <div className="space-y-5 px-4 pb-8 pt-5">
          <header className="space-y-1">
            <h1 className="text-lg font-semibold text-slate-900">เตรียมคอร์ด</h1>
            <p className="text-sm text-slate-500">ตรวจสอบเวลาเริ่มและเวลาสิ้นสุดของแต่ละคอร์ด</p>
          </header>

          {isLoading ? (
            <p role="status" className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">กำลังโหลดคอร์ด…</p>
          ) : startHour === null ? (
            <p role="alert" className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">ไม่พบเวลาเริ่มตี กรุณาย้อนกลับไปเลือกเวลา</p>
          ) : selectedCourts.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">ไม่พบคอร์ดที่เลือก กรุณาย้อนกลับไปเลือกคอร์ด</p>
          ) : (
            <section aria-label="รายการคอร์ด" className="flex flex-col gap-3">
              {selectedCourts.map((court) => {
                const endTime = calculateCourtEndTime(startHour, court.hours);

                return (
                  <article key={court.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="truncate text-base font-semibold text-slate-900">{court.name}</h2>
                      <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-primary">{court.hours} ชม.</span>
                    </div>
                    {endTime ? (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">เริ่มตี</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">{formatHour(startHour)}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">สิ้นสุด</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">{endTime.time}</p>
                          {endTime.daysLater > 0 ? <p className="mt-0.5 text-xs text-slate-500">อีก {endTime.daysLater} วัน</p> : null}
                        </div>
                      </div>
                    ) : (
                      <p role="alert" className="mt-3 text-sm text-red-600">จำนวนชั่วโมงของคอร์ดนี้ไม่ถูกต้อง</p>
                    )}
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
      <BottomActionNavigation onBack={handleBack} />
    </>
  );
}
