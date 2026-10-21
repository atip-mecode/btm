"use client";

import { useCallback, useEffect, useState } from "react";
import {
  localStorageMemberRepository,
  type Member,
  type MemberRepository,
} from "@/features/members/data/memberRepository";

export function useMembers(repository: MemberRepository = localStorageMemberRepository) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([repository.getMembers(), repository.getSelectedMemberIds()])
      .then(([savedMembers, savedIds]) => {
        if (!isCurrent) return;
        setMembers(savedMembers);
        setSelectedMemberIds(savedIds.filter((id) => savedMembers.some((member) => member.id === id)));
      })
      .catch(() => {
        if (isCurrent) setError("โหลดข้อมูลสมาชิกไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [repository]);

  const toggleMember = useCallback(async (memberId: string) => {
    const nextIds = selectedMemberIds.includes(memberId)
      ? selectedMemberIds.filter((id) => id !== memberId)
      : [...selectedMemberIds, memberId];
    try {
      await repository.saveSelectedMemberIds(nextIds);
      setSelectedMemberIds(nextIds);
      setError(null);
    } catch {
      setError("บันทึกสมาชิกที่เลือกไม่สำเร็จ");
    }
  }, [repository, selectedMemberIds]);

  const addMember = useCallback(async (rawName: string) => {
    const name = rawName.trim();
    if (!name) return false;
    try {
      const member = await repository.createMember(name);
      const nextMembers = [...members, member];
      const nextSelectedIds = [...selectedMemberIds, member.id];
      await repository.saveSelectedMemberIds(nextSelectedIds);
      setMembers(nextMembers);
      setSelectedMemberIds(nextSelectedIds);
      setError(null);
      return true;
    } catch {
      setError("เพิ่มสมาชิกไม่สำเร็จ ลองอีกครั้งนะ");
      return false;
    }
  }, [members, repository, selectedMemberIds]);

  return { members, selectedMemberIds, isLoading, error, toggleMember, addMember };
}
