"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { ListPlus, Plus, X } from "lucide-react";
import { MultiSelectField } from "@/components/forms/MultiSelectField";
import type { AddMemberData, MemberActionErrorCode } from "@/features/members/actions/memberActions";
import type { Member } from "@/features/members/data/memberRepository";
import { extractUsernames } from "@/features/members/utils/extractUsernames";
import type { ActionResult } from "@/lib/actionResult";

type MemberFormProps = {
  members: Member[];
  selectedMemberIds: string[];
  isLoading: boolean;
  error: string | null;
  toggleMember: (id: string) => Promise<ActionResult<string[], MemberActionErrorCode>>;
  selectMembers: (ids: string[]) => Promise<ActionResult<string[], MemberActionErrorCode>>;
  addMember: (name: string) => Promise<ActionResult<AddMemberData, MemberActionErrorCode>>;
};

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function MemberForm({ members, selectedMemberIds, isLoading, error, toggleMember, selectMembers, addMember }: MemberFormProps) {
  const [memberName, setMemberName] = useState("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [pastedNames, setPastedNames] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await addMember(memberName);
    if (result.success) setMemberName("");
  }

  async function handleImportNames(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const usernames = extractUsernames(pastedNames);
    if (usernames.length === 0) {
      setImportError("ไม่พบรายชื่อ ลองวางรายชื่อโดยแยกคนละบรรทัดนะ");
      return;
    }

    setIsImporting(true);
    setImportError(null);
    const membersByName = new Map(members.map((member) => [normalizeName(member.name), member]));
    const importedIds: string[] = [];

    for (const username of usernames) {
      const existingMember = membersByName.get(normalizeName(username));
      if (existingMember) {
        importedIds.push(existingMember.id);
        continue;
      }

      const result = await addMember(username);
      if (!result.success) {
        setImportError(result.error.message);
        setIsImporting(false);
        return;
      }

      membersByName.set(normalizeName(username), result.data.member);
      importedIds.push(result.data.member.id);
    }

    const selectedIds = [...new Set([...selectedMemberIds, ...importedIds])];
    const selectionResult = await selectMembers(selectedIds);
    setIsImporting(false);
    if (!selectionResult.success) {
      setImportError(selectionResult.error.message);
      return;
    }

    setPastedNames("");
    setIsImportDialogOpen(false);
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !isImporting) setIsImportDialogOpen(false);
  }

  return (
    <section className="space-y-4">
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
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="new-member-name" className="text-sm font-semibold text-slate-800">ชื่อสมาชิก</label>
          <button
            type="button"
            onClick={() => { setImportError(null); setIsImportDialogOpen(true); }}
            disabled={isLoading}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-primary transition-colors hover:bg-sky-50 disabled:opacity-50"
          >
            <ListPlus aria-hidden="true" size={17} /> แยกผู้เล่น
          </button>
        </div>
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
      {isImportDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4" onKeyDown={handleDialogKeyDown}>
          <button type="button" aria-label="ปิดหน้าต่างวางรายชื่อ" onClick={() => setIsImportDialogOpen(false)} disabled={isImporting} className="absolute inset-0 cursor-default" />
          <section role="dialog" aria-modal="true" aria-labelledby="import-members-title" className="relative z-10 w-full max-w-[430px] rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="import-members-title" className="text-lg font-semibold text-slate-900">วางรายชื่อผู้เล่น</h2>
                <p className="mt-1 text-sm text-slate-500">รองรับรายชื่อที่มีเลขลำดับ หรือแยกคนละบรรทัด</p>
              </div>
              <button type="button" aria-label="ปิดหน้าต่าง" onClick={() => setIsImportDialogOpen(false)} disabled={isImporting} className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-50">
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <form onSubmit={handleImportNames} className="space-y-4">
              <label className="sr-only" htmlFor="pasted-player-list">ข้อความรายชื่อผู้เล่น</label>
              <textarea
                id="pasted-player-list"
                autoFocus
                rows={9}
                maxLength={8000}
                value={pastedNames}
                onChange={(event) => { setPastedNames(event.target.value); setImportError(null); }}
                placeholder={'ลงชื่อตีแบดค่า\nพุธ 21/10 สนามแรก 18.00-20.00\n1. JANELY\n2. JOEY\n3. SANTIP'}
                className="min-h-52 w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm leading-6 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
              <p className="text-xs text-slate-500">พบ {extractUsernames(pastedNames).length} รายชื่อ · ชื่อเดิมจะถูกเลือกเพิ่ม</p>
              {importError ? <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">{importError}</p> : null}
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsImportDialogOpen(false)} disabled={isImporting} className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-50">ยกเลิก</button>
                <button type="submit" disabled={isImporting || !pastedNames.trim() || isLoading} className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50">
                  {isImporting ? "กำลังเพิ่มรายชื่อ…" : "ตกลงและเลือก"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}
