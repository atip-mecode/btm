import { circularWithHide } from "@/features/matching/services/circularWithHide";
import { pairKey, pairingMissing } from "@/features/matching/services/pairingMissing";
import { shuffleCircularPermutations } from "@/features/matching/services/shuffleCircularPermutations";
import type { PairCandidate } from "@/features/matching/types/pairingCandidate";
import type { PreparedMatchRecord } from "@/features/matching/types/preparedMatch";
import type { HourlyPairing, PairingResult } from "@/features/matching/types/pairingResult";

type HourlyPermutations = {
  startHour: number;
  endHour: number;
  permutations: PairCandidate<PreparedMatchRecord["players"][number]>[][];
};

function pairFromPermutations(
  prepare: PreparedMatchRecord,
  sourceHours: readonly HourlyPairing[],
  defaultPermutations: readonly HourlyPermutations[],
  fillin: boolean,
): PairingResult {
  const playedHours = new Map<string, number>();
  const previousPairCounts = new Map<string, number>();

  const hours = sourceHours.map((sourceHour, hourIndex): HourlyPairing => {
    const permutationSet = defaultPermutations.find((hour) => hour.startHour === sourceHour.startHour);
    const shuffledPermutations = shuffleCircularPermutations(permutationSet?.permutations ?? []);
    const circularPairs = shuffledPermutations.length === 0
      ? []
      : shuffledPermutations[hourIndex % shuffledPermutations.length];
    const repairedPairs = pairingMissing(circularPairs, previousPairCounts);
    const pairedWithPlayerHours = repairedPairs.sort((first, second) => {
      const occupancy = second.length - first.length;
      if (occupancy !== 0) return occupancy;
      const firstPlayed = first.reduce((total, slot) => total + (playedHours.get(slot.player.id) ?? 0), 0);
      const secondPlayed = second.reduce((total, slot) => total + (playedHours.get(slot.player.id) ?? 0), 0);
      return firstPlayed - secondPlayed;
    });
    const paired = pairedWithPlayerHours.map((pair) => pair.map((slot) => slot.player));
    const pairedPlayerIds = new Set(paired.flatMap((pair) => pair.map((player) => player.id)));
    const courts = sourceHour.courts.map((court) => ({ ...court, paireds: [] }));

    for (const playerId of pairedPlayerIds) {
      playedHours.set(playerId, (playedHours.get(playerId) ?? 0) + 1);
    }
    for (const pair of pairedWithPlayerHours) {
      if (pair.length !== 2) continue;
      const key = pairKey(pair[0].player.id, pair[1].player.id);
      previousPairCounts.set(key, (previousPairCounts.get(key) ?? 0) + 1);
    }

    return {
      startHour: sourceHour.startHour,
      endHour: sourceHour.endHour,
      courts,
      paired,
    };
  });

  return { fillin, prepare, hours };
}

/** Pair every available player by hour without assigning pairs to courts. */
export function resolvePairing(prepare: PreparedMatchRecord, fillin: boolean): PairingResult {
  const hours: HourlyPairing[] = [];
  const defaultPermutations: HourlyPermutations[] = [];
  const circleRoundCount = Math.max(0, prepare.players.length - 1);

  for (let startHour = prepare.maxRange.startHour; startHour < prepare.maxRange.endHour; startHour += 1) {
    const endHour = startHour + 1;
    const activeCourts = prepare.courts.filter(
      (court) => court.startHour <= startHour && court.endHour >= endHour,
    );
    if (activeCourts.length === 0) continue;

    const permutations = Array.from({ length: circleRoundCount }, (_, round) =>
      circularWithHide(prepare.players, startHour, endHour, round),
    );
    const permutationRecord: HourlyPermutations = {
      startHour,
      endHour,
      permutations,
    };
    defaultPermutations.push(permutationRecord);

    const courts = activeCourts.map((court) => ({
      courtId: court.id,
      courtName: court.name,
      paireds: [],
    }));

    hours.push({
      startHour,
      endHour,
      courts,
      paired: [],
    });
  }

  return pairFromPermutations(prepare, hours, defaultPermutations, fillin);
}
