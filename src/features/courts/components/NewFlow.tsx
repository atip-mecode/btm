"use client";

import { CourtForm } from "@/features/courts/components/CourtForm";
import { useCourts } from "@/features/courts/hooks/useCourts";
import { MemberForm } from "@/features/members/components/MemberForm";
import { useMembers } from "@/features/members/hooks/useMembers";
import { SelectedChips } from "@/components/forms/SelectedChips";

export function NewFlow() {
  const courtState = useCourts();
  const memberState = useMembers();
  const selectedCourts = courtState.courts.filter((court) => courtState.selectedCourtIds.includes(court.id));
  const selectedMembers = memberState.members.filter((member) => memberState.selectedMemberIds.includes(member.id));

  return (
    <div className="space-y-7 px-4 pb-8 pt-5">
      <section aria-label="ตั้งค่าคอร์ดและสมาชิก" className="space-y-7">
        <CourtForm {...courtState} />
        <MemberForm {...memberState} />
      </section>
      <section aria-label="สรุปรายการที่เลือก" className="space-y-4 border-t border-slate-200 pt-5">
        <h2 className="text-base font-semibold text-slate-900">รายการที่เลือก</h2>
        <SelectedChips label="คอร์ดที่เลือก" items={selectedCourts} onRemove={(id) => void courtState.toggleCourt(id)} />
        <SelectedChips label="สมาชิกที่เลือก" items={selectedMembers} onRemove={(id) => void memberState.toggleMember(id)} />
      </section>
    </div>
  );
}
