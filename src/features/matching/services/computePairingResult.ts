import type { PairingResult } from "@/features/matching/types/pairingResult";

const PAIRS_PER_COURT = 2;

export function computePairingResult(result: PairingResult, fillin: boolean): PairingResult {
  return {
    ...result,
    hours: result.hours.map((hour) => {
      const courts = hour.courts.map((court, courtIndex) => ({
        ...court,
        paireds: fillin
          ? hour.paired.filter((_, pairIndex) => pairIndex % hour.courts.length === courtIndex)
          : hour.paired.slice(courtIndex * PAIRS_PER_COURT, (courtIndex + 1) * PAIRS_PER_COURT),
      }));

      return {
        ...hour,
        courts,
        paired: fillin ? [] : hour.paired.slice(hour.courts.length * PAIRS_PER_COURT),
      };
    }),
  };
}
