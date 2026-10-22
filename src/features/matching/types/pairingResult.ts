import type { PreparedPlayerSchedule } from "@/features/matching/types/preparedMatch";
import type { PreparedMatchRecord } from "@/features/matching/types/preparedMatch";

export type Player = PreparedPlayerSchedule;

export type CourtPairing = {
  courtId: string;
  courtName: string;
  paireds: Player[][];
};

export type HourlyPairing = {
  startHour: number;
  endHour: number;
  courts: CourtPairing[];
  paired: Player[][];
};

export type PairingResult = {
  fillin: boolean;
  hours: HourlyPairing[];
  /** Preparation snapshot used to produce this result and future rerolls. */
  prepare?: PreparedMatchRecord;
};
