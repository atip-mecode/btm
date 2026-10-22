"use client";

import { useCallback, useEffect, useState } from "react";
import {
  localStorageMemberRepository,
  type Member,
  type MemberRepository,
} from "@/features/members/data/memberRepository";
import {
  addMemberAction,
  getMembersAction,
  saveSelectedMembersAction,
} from "@/features/members/actions/memberActions";

export function useMembers(repository: MemberRepository = localStorageMemberRepository) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    getMembersAction(repository).then((result) => {
      if (!isCurrent) return;
      if (result.success) {
        setMembers(result.data.members);
        setSelectedMemberIds(result.data.selectedMemberIds);
        return;
      }
      setError(result.error.message);
    }).finally(() => {
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
    const result = await saveSelectedMembersAction(repository, nextIds);
    if (result.success) {
      setSelectedMemberIds(result.data);
      setError(null);
    } else {
      setError(result.error.message);
    }
    return result;
  }, [repository, selectedMemberIds]);

  const selectMembers = useCallback(async (memberIds: string[]) => {
    const result = await saveSelectedMembersAction(repository, memberIds);
    if (result.success) {
      setSelectedMemberIds(result.data);
      setError(null);
    } else {
      setError(result.error.message);
    }
    return result;
  }, [repository]);

  const addMember = useCallback(async (name: string) => {
    const result = await addMemberAction(repository, name);
    if (result.success) {
      setMembers((currentMembers) => [...currentMembers, result.data.member]);
      setSelectedMemberIds(result.data.selectedMemberIds);
      setError(null);
    } else {
      setError(result.error.message);
    }
    return result;
  }, [repository]);

  return { members, selectedMemberIds, isLoading, error, toggleMember, selectMembers, addMember };
}
