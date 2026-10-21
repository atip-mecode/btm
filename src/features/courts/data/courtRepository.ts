export type Court = {
  id: string;
  name: string;
  hours: number;
};

export type CreateCourtInput = Omit<Court, "id">;

export class CourtRepositoryError extends Error {
  constructor(
    readonly code: "DUPLICATE_NAME" | "PERSISTENCE_ERROR",
    message: string,
  ) {
    super(message);
    this.name = "CourtRepositoryError";
  }
}

/** Swap this adapter for an API-backed repository without coupling persistence to UI. */
export interface CourtRepository {
  getCourts(): Promise<Court[]>;
  createCourt(input: CreateCourtInput): Promise<Court>;
  getSelectedCourtIds(): Promise<string[]>;
  saveSelectedCourtIds(ids: string[]): Promise<void>;
}

const courtsKey = "btm.courts";
const selectedCourtsKey = "btm.selectedCourtIds";

function readJson<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function createId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export const localStorageCourtRepository: CourtRepository = {
  async getCourts() {
    return readJson<Court[]>(courtsKey, []);
  },

  async createCourt(input) {
    const courts = readJson<Court[]>(courtsKey, []);
    if (courts.some((court) => normalizeName(court.name) === normalizeName(input.name))) {
      throw new CourtRepositoryError("DUPLICATE_NAME", "มีชื่อคอร์ดนี้แล้ว");
    }
    const court = { id: createId(), ...input };
    window.localStorage.setItem(courtsKey, JSON.stringify([...courts, court]));
    return court;
  },

  async getSelectedCourtIds() {
    return readJson<string[]>(selectedCourtsKey, []);
  },

  async saveSelectedCourtIds(ids) {
    window.localStorage.setItem(selectedCourtsKey, JSON.stringify(ids));
  },
};
