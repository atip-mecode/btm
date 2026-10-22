import { parsePairingResult } from "@/features/matching/services/pairingResultSchema";
import type { PairingResult } from "@/features/matching/types/pairingResult";

export type MatchRoom = {
  id: string;
  createdAt: string;
  fillin: boolean;
  result: PairingResult;
};

export type SaveRoomInput = Omit<MatchRoom, "createdAt">;

export class RoomRepositoryError extends Error {
  constructor(readonly code: "PERSISTENCE_ERROR", message: string) {
    super(message);
    this.name = "RoomRepositoryError";
  }
}

export interface RoomRepository {
  getRooms(): Promise<MatchRoom[]>;
  saveRoom(input: SaveRoomInput): Promise<MatchRoom>;
}

const roomsKey = "btm.rooms";

function parseMatchRoom(value: unknown): MatchRoom | null {
  if (!(typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && "id" in value
    && typeof value.id === "string"
    && value.id.length > 0
    && "createdAt" in value
    && typeof value.createdAt === "string"
    && Number.isFinite(Date.parse(value.createdAt))
    && "result" in value)) return null;

  const resultRecord = typeof value.result === "object" && value.result !== null && !Array.isArray(value.result)
    ? value.result
    : null;
  const legacyFillin = "fillin" in value && typeof value.fillin === "boolean"
    ? value.fillin
    : resultRecord && "fillin" in resultRecord && typeof resultRecord.fillin === "boolean"
      ? resultRecord.fillin
      : false;
  const result = parsePairingResult(value.result);
  return result ? { id: value.id, createdAt: value.createdAt, fillin: legacyFillin, result } : null;
}

function readRooms(): MatchRoom[] {
  const raw = window.localStorage.getItem(roomsKey);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.flatMap((room) => {
      const parsedRoom = parseMatchRoom(room);
      return parsedRoom ? [parsedRoom] : [];
    }) : [];
  } catch {
    return [];
  }
}

export const localStorageRoomRepository: RoomRepository = {
  async getRooms() {
    return readRooms().sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  },

  async saveRoom(input) {
    const rooms = readRooms();
    const existingRoom = rooms.find((room) => room.id === input.id);
    const room: MatchRoom = {
      ...input,
      createdAt: existingRoom?.createdAt ?? new Date().toISOString(),
    };
    const nextRooms = [room, ...rooms.filter((candidate) => candidate.id !== room.id)];
    window.localStorage.setItem(roomsKey, JSON.stringify(nextRooms));
    return room;
  },
};
