"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { MultiSelectField } from "@/components/forms/MultiSelectField";
import type { AddMemberData, MemberActionErrorCode } from "@/features/members/actions/memberActions";
import type { Member } from "@/features/members/data/memberRepository";
import type { ActionResult } from "@/lib/actionResult";

type MemberFormProps = {
  members: Member[];
  selectedMemberIds: string[];
  isLoading: boolean;
  error: string | null;
  toggleMember: (id: string) => Promise<ActionResult<string[], MemberActionErrorCode>>;
  addMember: (name: string) => Promise<ActionResult<AddMemberData, MemberActionErrorCode>>;
};

export function MemberForm({ members, selectedMemberIds, isLoading, error, toggleMember, addMember }: MemberFormProps) {
  const [memberName, setMemberName] = useState("");

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await addMember(memberName);
    if (result.success) setMemberName("");
  }

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-slate-900">สมาชิก</h2>
      <MultiSelectField
        id="member-select"
        label="เลือกสมาชิก"
        placeholder="เลือกสมาชิกได้หลายคน"
        emptyMessage="ยังไม่มีสมาชิก เพิ่มชื่อด้านล่างได้เลย"
        options={members}
        selectedIds={selectedMemberIds}
        isLoading={isLoading}
        onToggle={(id) => void toggleMember(id)}
      />
      <div className="space-y-2">
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
      </div>
      {error ? <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
