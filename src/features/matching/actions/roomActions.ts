import type { ActionResult } from "@/lib/actionResult";
import {
  type MatchRoom,
  type RoomRepository,
  type SaveRoomInput,
} from "@/features/matching/data/roomRepository";

export type RoomActionErrorCode = "PERSISTENCE_ERROR";

function failure<T>(message: string): ActionResult<T, RoomActionErrorCode> {
  return { success: false, error: { code: "PERSISTENCE_ERROR", message } };
}

export async function getRoomsAction(
  repository: RoomRepository,
): Promise<ActionResult<MatchRoom[], RoomActionErrorCode>> {
  try {
    return { success: true, data: await repository.getRooms() };
  } catch {
    return failure("โหลดรายการห้องไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง");
  }
}

export async function saveRoomAction(
  repository: RoomRepository,
  input: SaveRoomInput,
): Promise<ActionResult<MatchRoom, RoomActionErrorCode>> {
  try {
    return { success: true, data: await repository.saveRoom(input) };
  } catch {
    return failure("บันทึกผลจับคู่ไม่สำเร็จ ลองอีกครั้งนะ");
  }
}
