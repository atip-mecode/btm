"use client";

import { useState, type FormEvent } from "react";
import { Check, ChevronDown, Plus, Users, X } from "lucide-react";
import { useMembers } from "@/features/members/hooks/useMembers";

export function MemberForm() {
  const { members, selectedMemberIds, isLoading, error, toggleMember, addMember } = useMembers();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [memberName, setMemberName] = useState("");
  const selectedMembers = members.filter((member) => selectedMemberIds.includes(member.id));

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await addMember(memberName);
    if (result.success) setMemberName("");
  }

  return (
    <div className="space-y-6 px-4 pb-8 pt-5">
      <section className="space-y-2">
        <label htmlFor="member-select" className="text-sm font-semibold text-slate-800">เลือกสมาชิก</label>
        <div className="relative">
          <button
            id="member-select"
            type="button"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            disabled={isLoading}
            onClick={() => setIsDropdownOpen((open) => !open)}
            className="flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-left text-sm shadow-sm outline-none transition focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-100 disabled:opacity-60"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Users aria-hidden="true" size={18} className="shrink-0 text-slate-400" />
              <span className="truncate text-slate-700">{isLoading ? "กำลังโหลดสมาชิก…" : selectedMembers.length ? `เลือกแล้ว ${selectedMembers.length} คน` : "เลือกสมาชิกได้หลายคน"}</span>
            </span>
            <ChevronDown aria-hidden="true" size={18} className={`shrink-0 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen ? (
            <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {members.length ? (
                <div aria-label="รายชื่อสมาชิก" role="listbox" aria-multiselectable="true" className="max-h-56 overflow-y-auto p-1.5">
                  {members.map((member) => {
                    const selected = selectedMemberIds.includes(member.id);
                    return (
                      <button key={member.id} type="button" role="option" aria-selected={selected} onClick={() => void toggleMember(member.id)} className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                        <span>{member.name}</span>
                        {selected ? <Check aria-hidden="true" size={17} className="text-primary" /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="px-3 py-4 text-sm text-slate-500">ยังไม่มีสมาชิก เพิ่มชื่อด้านล่างได้เลย</p>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-2">
        <label htmlFor="new-member-name" className="text-sm font-semibold text-slate-800">ชื่อสมาชิก</label>
        <form onSubmit={handleAddMember} className="space-y-3">
          <input
            id="new-member-name"
            type="text"
            autoComplete="off"
            maxLength={80}
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
            placeholder="กรอกชื่อสมาชิก"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
          <button type="submit" disabled={!memberName.trim() || isLoading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45">
            <Plus aria-hidden="true" size={17} /> เพิ่มสมาชิกใหม่
          </button>
        </form>
      </section>

      <section aria-live="polite" className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-800">สมาชิกที่เลือก ({selectedMembers.length})</h2>
        {selectedMembers.length ? (
          <ul className="flex flex-wrap gap-2">
            {selectedMembers.map((member) => (
              <li key={member.id} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-sky-100 bg-white py-1 pl-3 pr-1.5 text-sm text-slate-700 shadow-sm">
                {member.name}
                <button type="button" aria-label={`นำ ${member.name} ออกจากรายการที่เลือก`} onClick={() => void toggleMember(member.id)} className="flex size-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X aria-hidden="true" size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">ยังไม่ได้เลือกสมาชิก</p>
        )}
      </section>

      {error ? <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
