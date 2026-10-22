import type { PairingResult, Player } from "@/features/matching/types/pairingResult";

const PAIRS_PER_COURT = 2;

export type ComputedPair = {
  players: Player[];
  sourcePairIndex: number;
};

export type ComputedPairingResult = Omit<PairingResult, "hours"> & {
  hours: Array<Omit<PairingResult["hours"][number], "courts" | "paired"> & {
    courts: Array<Omit<PairingResult["hours"][number]["courts"][number], "paireds"> & { paireds: ComputedPair[] }>;
    paired: ComputedPair[];
  }>;
};

export function computePairingResult(result: PairingResult, fillin: boolean): ComputedPairingResult {
  return {
    ...result,
    hours: result.hours.map((hour) => {
      const pairs = hour.paired.map((players, sourcePairIndex) => ({ players, sourcePairIndex }));
      const courts = hour.courts.map((court, courtIndex) => ({
        courtId: court.courtId,
        courtName: court.courtName,
        paireds: fillin
          ? pairs.filter((_, pairIndex) => hour.courts.length > 0 && pairIndex % hour.courts.length === courtIndex)
          : pairs.slice(courtIndex * PAIRS_PER_COURT, (courtIndex + 1) * PAIRS_PER_COURT),
      }));

      return {
        startHour: hour.startHour,
        endHour: hour.endHour,
        courts,
        paired: fillin ? [] : pairs.slice(hour.courts.length * PAIRS_PER_COURT),
      };
    }),
  };
}
