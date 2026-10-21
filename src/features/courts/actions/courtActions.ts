import type { ActionResult } from "@/lib/actionResult";
import {
  CourtRepositoryError,
  type Court,
  type CourtRepository,
  type CreateCourtInput,
} from "@/features/courts/data/courtRepository";

export type CourtActionErrorCode = "INVALID_HOURS" | "DUPLICATE_NAME" | "PERSISTENCE_ERROR";

export type CourtWorkspace = {
  courts: Court[];
  selectedCourtIds: string[];
};

export type AddCourtData = {
  court: Court;
  selectedCourtIds: string[];
};

export function createSuggestedCourtName() {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
  return `Court-${suffix}`;
}

function failure<T>(code: CourtActionErrorCode, message: string): ActionResult<T, CourtActionErrorCode> {
  return { success: false, error: { code, message } };
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export async function getCourtsAction(
  repository: CourtRepository,
): Promise<ActionResult<CourtWorkspace, CourtActionErrorCode>> {
  try {
    const [courts, savedIds] = await Promise.all([
      repository.getCourts(),
      repository.getSelectedCourtIds(),
    ]);
    const courtIds = new Set(courts.map((court) => court.id));
    return {
      success: true,
      data: {
        courts,
        selectedCourtIds: savedIds.filter((id) => courtIds.has(id)),
      },
    };
  } catch {
    return failure("PERSISTENCE_ERROR", "โหลดข้อมูลคอร์ดไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง");
  }
}

export async function addCourtAction(
  repository: CourtRepository,
  input: { name: string; hours: number },
): Promise<ActionResult<AddCourtData, CourtActionErrorCode>> {
  if (!Number.isInteger(input.hours) || input.hours < 1) {
    return failure("INVALID_HOURS", "จำนวนชั่วโมงต้องเป็นจำนวนเต็มตั้งแต่ 1 ชั่วโมงขึ้นไป");
  }

  const name = input.name.trim().replace(/\s+/g, " ") || createSuggestedCourtName();
  const courtInput: CreateCourtInput = { name, hours: input.hours };

  try {
    const courts = await repository.getCourts();
    if (courts.some((court) => normalizeName(court.name) === normalizeName(name))) {
      return failure("DUPLICATE_NAME", "มีชื่อคอร์ดนี้แล้ว");
    }

    const court = await repository.createCourt(courtInput);
    const selectedCourtIds = [...await repository.getSelectedCourtIds(), court.id];
    await repository.saveSelectedCourtIds(selectedCourtIds);
    return { success: true, data: { court, selectedCourtIds } };
  } catch (error) {
    if (error instanceof CourtRepositoryError && error.code === "DUPLICATE_NAME") {
      return failure("DUPLICATE_NAME", error.message);
    }
    return failure("PERSISTENCE_ERROR", "เพิ่มคอร์ดไม่สำเร็จ ลองอีกครั้งนะ");
  }
}

export async function saveSelectedCourtsAction(
  repository: CourtRepository,
  selectedCourtIds: string[],
): Promise<ActionResult<string[], CourtActionErrorCode>> {
  try {
    await repository.saveSelectedCourtIds(selectedCourtIds);
    return { success: true, data: selectedCourtIds };
  } catch {
    return failure("PERSISTENCE_ERROR", "บันทึกคอร์ดที่เลือกไม่สำเร็จ");
  }
}
