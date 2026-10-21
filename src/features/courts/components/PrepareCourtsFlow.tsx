"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { BottomActionNavigation } from "@/components/layout/BottomActionNavigation";
import { useCourts } from "@/features/courts/hooks/useCourts";
import { useMembers } from "@/features/members/hooks/useMembers";
import { calculateCourtTimeRange, hasContinuousCourtOverlap } from "@/features/courts/utils/courtSchedule";
import { resolvePairing } from "@/features/matching/actions/pairingActions";
import { encodePairingResult } from "@/features/matching/services/pairingUrlState";
import type { PreparedMatchRecord } from "@/features/matching/types/preparedMatch";

type PrepareCourtsFlowProps = {
  startHour: number | null;
  selectedCourtIds: string[];
};

export function PrepareCourtsFlow({ startHour, selectedCourtIds }: PrepareCourtsFlowProps) {
  const router = useRouter();
  const [startHourOffsets, setStartHourOffsets] = useState<Record<string, number>>({});
  const [memberEndHours, setMemberEndHours] = useState<Record<string, number>>({});
  const [memberStartHours, setMemberStartHours] = useState<Record<string, number>>({});
  const { courts, isLoading } = useCourts();
  const { members, selectedMemberIds, isLoading: areMembersLoading } = useMembers();
  const courtsById = new Map(courts.map((court) => [court.id, court]));
  const selectedCourts = selectedCourtIds.flatMap((id) => {
    const court = courtsById.get(id);
    return court ? [court] : [];
  });
  const selectedMembers = selectedMemberIds.flatMap((id) => {
    const member = members.find((candidate) => candidate.id === id);
    return member ? [member] : [];
  });
  const validCourtRanges = selectedCourts.flatMap((court) => {
    if (!Number.isInteger(court.hours) || court.hours < 1 || startHour === null) return [];
    const rangeStart = startHour + (startHourOffsets[court.id] ?? 0);
    return [{ id: court.id, start: rangeStart, end: rangeStart + court.hours }];
  });
  const hasCompleteCourtRange = validCourtRanges.length === selectedCourts.length && validCourtRanges.length > 0;
  const playerRangeStart = hasCompleteCourtRange
    ? Math.min(...validCourtRanges.map((range) => range.start))
    : null;
  const playerRangeEnd = hasCompleteCourtRange
    ? Math.max(...validCourtRanges.map((range) => range.end))
    : null;
  const maxPlayHours = playerRangeStart !== null && playerRangeEnd !== null
    ? playerRangeEnd - playerRangeStart
    : null;
  function handleBack() {
    const params = new URLSearchParams();
    if (startHour !== null) params.set("start", String(startHour).padStart(2, "0"));
    router.push(`/new?${params.toString()}`);
  }

  function shiftCourtStart(courtId: string, hours: number) {
    if (!canShiftCourtStart(courtId, hours)) return;

    setStartHourOffsets((offsets) => ({
      ...offsets,
      [courtId]: (offsets[courtId] ?? 0) + hours,
    }));
    setMemberStartHours({});
    setMemberEndHours({});
  }

  function canShiftCourtStart(courtId: string, hours: number) {
    if (validCourtRanges.length !== selectedCourts.length) return false;

    const nextRanges = validCourtRanges.map((range) => (
      range.id === courtId
        ? { ...range, start: range.start + hours, end: range.end + hours }
        : range
    ));
    return hasContinuousCourtOverlap(nextRanges);
  }

  function getMemberSchedule(memberId: string) {
    if (maxPlayHours === null || playerRangeStart === null || playerRangeEnd === null) return null;

    const earliestEnd = playerRangeStart + 1;
    const end = Math.min(Math.max(memberEndHours[memberId] ?? playerRangeEnd, earliestEnd), playerRangeEnd);
    const start = Math.min(Math.max(memberStartHours[memberId] ?? playerRangeStart, playerRangeStart), end - 1);
    return { start, end, hours: end - start };
  }

  function canAdjustMemberStart(memberId: string, change: number) {
    const schedule = getMemberSchedule(memberId);
    const nextStart = (schedule?.start ?? 0) + change;
    return schedule !== null
      && nextStart >= (playerRangeStart ?? 0)
      && nextStart < schedule.end;
  }

  function adjustMemberStart(memberId: string, change: number) {
    const schedule = getMemberSchedule(memberId);
    if (!schedule || !canAdjustMemberStart(memberId, change)) return;

    setMemberStartHours((currentStarts) => ({
      ...currentStarts,
      [memberId]: schedule.start + change,
    }));
  }

  function canAdjustMemberEnd(memberId: string, change: number) {
    const schedule = getMemberSchedule(memberId);
    return schedule !== null
      && schedule.end + change > schedule.start
      && schedule.end + change <= (playerRangeEnd ?? 0);
  }

  function adjustMemberEnd(memberId: string, change: number) {
    const schedule = getMemberSchedule(memberId);
    if (!schedule || !canAdjustMemberEnd(memberId, change)) return;

    setMemberEndHours((currentEnds) => ({
      ...currentEnds,
      [memberId]: schedule.end + change,
    }));
  }

  function handlePairing() {
    if (startHour === null || playerRangeStart === null || playerRangeEnd === null || maxPlayHours === null) return;
    if (!hasCompleteCourtRange || selectedMembers.length === 0) return;

    const players = selectedMembers.flatMap((member) => {
      const schedule = getMemberSchedule(member.id);
      return schedule ? [{ id: member.id, name: member.name, startHour: schedule.start, endHour: schedule.end }] : [];
    });
    if (players.length !== selectedMembers.length) return;

    const prepared: PreparedMatchRecord = {
      maxRange: { startHour: playerRangeStart, endHour: playerRangeEnd, hours: maxPlayHours },
      courts: selectedCourts.map((court) => {
        const courtStart = startHour + (startHourOffsets[court.id] ?? 0);
        return {
          id: court.id,
          name: court.name,
          bookedHours: court.hours,
          startHour: courtStart,
          endHour: courtStart + court.hours,
        };
      }),
      players,
    };
    const state = encodePairingResult(resolvePairing(prepared));
    router.push(`/match?${new URLSearchParams({ state, fillin: "false" }).toString()}`);
  }

  return (
    <>
      <main aria-label="เตรียมคอร์ด" className="min-h-0 flex-1 overflow-y-auto pb-[calc(84px+env(safe-area-inset-bottom))]">
        <div className="space-y-5 px-4 pb-8 pt-5">
          <header className="space-y-1">
            <h1 className="text-lg font-semibold text-slate-900">เตรียมคอร์ด</h1>
            <p className="text-sm text-slate-500">ตรวจสอบเวลาเริ่มและเวลาสิ้นสุดของแต่ละคอร์ด</p>
          </header>

          {maxPlayHours !== null ? (
            <section aria-label="เวลาเล่นสูงสุด" className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">เวลาเล่นสูงสุด</h2>
                <p className="text-xs text-slate-500">ตั้งแต่คอร์ดเริ่มเร็วสุดถึงคอร์ดจบช้าที่สุด</p>
              </div>
              <p className="shrink-0 text-lg font-bold text-primary" aria-live="polite">{maxPlayHours} ชม.</p>
            </section>
          ) : null}

          {isLoading ? (
            <p role="status" className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">กำลังโหลดคอร์ด…</p>
          ) : startHour === null ? (
            <p role="alert" className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">ไม่พบเวลาเริ่มตี กรุณาย้อนกลับไปเลือกเวลา</p>
          ) : selectedCourts.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">ไม่พบคอร์ดที่เลือก กรุณาย้อนกลับไปเลือกคอร์ด</p>
          ) : (
            <section aria-label="รายการคอร์ด" className="flex flex-col gap-3">
              {selectedCourts.map((court) => {
                const courtStartHour = startHour + (startHourOffsets[court.id] ?? 0);
                const timeRange = calculateCourtTimeRange(courtStartHour, court.hours);

                return (
                  <article key={court.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="truncate text-base font-semibold text-slate-900">{court.name}</h2>
                      <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-primary">{court.hours} ชม.</span>
                    </div>
                    {timeRange ? (
                      <div className="mt-4 rounded-xl bg-slate-50 p-3">
                        <div aria-live="polite" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          <div>
                            <p className="text-xs text-slate-500">เริ่มตี</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">{timeRange.startTime}</p>
                            {timeRange.startDaysLater !== 0 ? <p className="mt-0.5 text-xs text-slate-500">{timeRange.startDaysLater > 0 ? `อีก ${timeRange.startDaysLater} วัน` : `ก่อนหน้า ${Math.abs(timeRange.startDaysLater)} วัน`}</p> : null}
                          </div>
                          <ArrowRight aria-hidden="true" size={17} className="text-slate-400" />
                          <div className="text-right">
                            <p className="text-xs text-slate-500">สิ้นสุด</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">{timeRange.endTime}</p>
                            {timeRange.endDaysLater !== 0 ? <p className="mt-0.5 text-xs text-slate-500">{timeRange.endDaysLater > 0 ? `อีก ${timeRange.endDaysLater} วัน` : `ก่อนหน้า ${Math.abs(timeRange.endDaysLater)} วัน`}</p> : null}
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            aria-label={`เลื่อนเวลาเริ่ม ${court.name} เร็วขึ้น 1 ชั่วโมง`}
                            disabled={!canShiftCourtStart(court.id, -1)}
                            onClick={() => shiftCourtStart(court.id, -1)}
                            className="flex min-h-10 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronLeft aria-hidden="true" size={15} /> −1 ชม.
                          </button>
                          <button
                            type="button"
                            aria-label={`เลื่อนเวลาเริ่ม ${court.name} ช้าลง 1 ชั่วโมง`}
                            disabled={!canShiftCourtStart(court.id, 1)}
                            onClick={() => shiftCourtStart(court.id, 1)}
                            className="flex min-h-10 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +1 ชม. <ChevronRight aria-hidden="true" size={15} />
                          </button>
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

          {!isLoading && startHour !== null && selectedCourts.length > 0 ? (
            <section aria-label="รายการผู้เล่น" className="flex flex-col gap-3">
              <header className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900">ผู้เล่น</h2>
                <p className="text-sm text-slate-500">ช่วงเวลาอ้างอิงจากคอร์ดที่เริ่มเร็วสุดและจบช้าที่สุด</p>
              </header>
              {areMembersLoading ? (
                <p role="status" className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">กำลังโหลดผู้เล่น…</p>
              ) : selectedMembers.length === 0 ? (
                <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">ยังไม่มีผู้เล่นที่เลือก</p>
              ) : playerRangeStart === null || playerRangeEnd === null ? (
                <p role="alert" className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">คำนวณช่วงเวลาผู้เล่นไม่ได้ เพราะข้อมูลชั่วโมงของคอร์ดไม่ถูกต้อง</p>
              ) : (
                selectedMembers.map((member) => {
                  const schedule = getMemberSchedule(member.id);
                  const timeRange = schedule
                    ? calculateCourtTimeRange(schedule.start, schedule.hours)
                    : null;

                  return (
                    <article key={member.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="truncate text-base font-semibold text-slate-900">{member.name}</h3>
                        {schedule ? <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-primary">{schedule.hours} ชม.</span> : null}
                      </div>
                      {timeRange ? (
                        <div className="mt-4 rounded-xl bg-slate-50 p-3">
                          <div aria-live="polite" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                            <div>
                              <p className="text-xs text-slate-500">เริ่มตี</p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">{timeRange.startTime}</p>
                              {timeRange.startDaysLater !== 0 ? <p className="mt-0.5 text-xs text-slate-500">{timeRange.startDaysLater > 0 ? `อีก ${timeRange.startDaysLater} วัน` : `ก่อนหน้า ${Math.abs(timeRange.startDaysLater)} วัน`}</p> : null}
                            </div>
                            <ArrowRight aria-hidden="true" size={17} className="text-slate-400" />
                            <div className="text-right">
                              <p className="text-xs text-slate-500">สิ้นสุด</p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">{timeRange.endTime}</p>
                              {timeRange.endDaysLater !== 0 ? <p className="mt-0.5 text-xs text-slate-500">{timeRange.endDaysLater > 0 ? `อีก ${timeRange.endDaysLater} วัน` : `ก่อนหน้า ${Math.abs(timeRange.endDaysLater)} วัน`}</p> : null}
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-slate-500">เวลาเริ่ม</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  aria-label={`เลื่อนเวลาเริ่ม ${member.name} เร็วขึ้น 1 ชั่วโมง`}
                                  disabled={!canAdjustMemberStart(member.id, -1)}
                                  onClick={() => adjustMemberStart(member.id, -1)}
                                  className="min-h-10 min-w-16 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                                >−1 ชม.</button>
                                <button
                                  type="button"
                                  aria-label={`เลื่อนเวลาเริ่ม ${member.name} ช้าลง 1 ชั่วโมง`}
                                  disabled={!canAdjustMemberStart(member.id, 1)}
                                  onClick={() => adjustMemberStart(member.id, 1)}
                                  className="min-h-10 min-w-16 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                                >+1 ชม.</button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-slate-500">เวลาจบ</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  aria-label={`เลื่อนเวลาจบ ${member.name} เร็วขึ้น 1 ชั่วโมง`}
                                  disabled={!canAdjustMemberEnd(member.id, -1)}
                                  onClick={() => adjustMemberEnd(member.id, -1)}
                                  className="min-h-10 min-w-16 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                                >−1 ชม.</button>
                                <button
                                  type="button"
                                  aria-label={`เลื่อนเวลาจบ ${member.name} ช้าลง 1 ชั่วโมง`}
                                  disabled={!canAdjustMemberEnd(member.id, 1)}
                                  onClick={() => adjustMemberEnd(member.id, 1)}
                                  className="min-h-10 min-w-16 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                                >+1 ชม.</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p role="alert" className="mt-3 text-sm text-red-600">ช่วงเวลาของผู้เล่นไม่ถูกต้อง</p>
                      )}
                    </article>
                  );
                })
              )}
            </section>
          ) : null}
        </div>
      </main>
      <BottomActionNavigation
        onBack={handleBack}
        onNext={handlePairing}
        nextLabel="จับคู่"
        nextDisabled={isLoading || areMembersLoading || !hasCompleteCourtRange || selectedMembers.length === 0}
      />
    </>
  );
}
