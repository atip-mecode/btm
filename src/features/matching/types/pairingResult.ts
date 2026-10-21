import type { PreparedPlayerSchedule } from "@/features/matching/types/preparedMatch";

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
  hours: HourlyPairing[];
};
