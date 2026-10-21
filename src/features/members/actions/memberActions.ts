import type { ActionResult } from "@/lib/actionResult";
import { MemberRepositoryError, type Member, type MemberRepository } from "@/features/members/data/memberRepository";

export type MemberActionErrorCode = "INVALID_NAME" | "DUPLICATE_NAME" | "PERSISTENCE_ERROR";

export type MemberWorkspace = {
  members: Member[];
  selectedMemberIds: string[];
};

export type AddMemberData = {
  member: Member;
  selectedMemberIds: string[];
};

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function failure<T>(code: MemberActionErrorCode, message: string): ActionResult<T, MemberActionErrorCode> {
  return { success: false, error: { code, message } };
}

/** Read member data through the current adapter; API-backed repositories can use this same action. */
export async function getMembersAction(
  repository: MemberRepository,
): Promise<ActionResult<MemberWorkspace, MemberActionErrorCode>> {
  try {
    const [members, savedIds] = await Promise.all([
      repository.getMembers(),
      repository.getSelectedMemberIds(),
    ]);
    const memberIds = new Set(members.map((member) => member.id));
    return {
      success: true,
      data: {
        members,
        selectedMemberIds: savedIds.filter((id) => memberIds.has(id)),
      },
    };
  } catch {
    return failure("PERSISTENCE_ERROR", "โหลดข้อมูลสมาชิกไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง");
  }
}

/** Validate, create, and select a member while keeping failures in a predictable result shape. */
export async function addMemberAction(
  repository: MemberRepository,
  rawName: string,
): Promise<ActionResult<AddMemberData, MemberActionErrorCode>> {
  const name = rawName.trim().replace(/\s+/g, " ");
  if (!name) {
    return failure("INVALID_NAME", "กรุณากรอกชื่อสมาชิก");
  }

  try {
    const members = await repository.getMembers();
    const normalizedName = normalizeName(name);
    if (members.some((member) => normalizeName(member.name) === normalizedName)) {
      return failure("DUPLICATE_NAME", "มีชื่อนี้ในรายชื่อสมาชิกแล้ว");
    }

    const member = await repository.createMember(name);
    const selectedMemberIds = [...await repository.getSelectedMemberIds(), member.id];
    await repository.saveSelectedMemberIds(selectedMemberIds);
    return { success: true, data: { member, selectedMemberIds } };
  } catch (error) {
    if (error instanceof MemberRepositoryError && error.code === "DUPLICATE_NAME") {
      return failure("DUPLICATE_NAME", error.message);
    }
    return failure("PERSISTENCE_ERROR", "เพิ่มสมาชิกไม่สำเร็จ ลองอีกครั้งนะ");
  }
}

export async function saveSelectedMembersAction(
  repository: MemberRepository,
  selectedMemberIds: string[],
): Promise<ActionResult<string[], MemberActionErrorCode>> {
  try {
    await repository.saveSelectedMemberIds(selectedMemberIds);
    return { success: true, data: selectedMemberIds };
  } catch {
    return failure("PERSISTENCE_ERROR", "บันทึกสมาชิกที่เลือกไม่สำเร็จ");
  }
}
