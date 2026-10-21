import { circularWithHide } from "@/features/matching/services/circularWithHide";
import { pairKey, pairingMissing } from "@/features/matching/services/pairingMissing";
import type { PreparedMatchRecord } from "@/features/matching/types/preparedMatch";
import type { HourlyPairing, PairingResult } from "@/features/matching/types/pairingResult";

/** Pair every available player by hour without assigning pairs to courts. */
export function resolvePairing(prepare: PreparedMatchRecord): PairingResult {
  const playedHours = new Map<string, number>();
  const previousPairCounts = new Map<string, number>();
  const hours: HourlyPairing[] = [];

  for (let startHour = prepare.maxRange.startHour; startHour < prepare.maxRange.endHour; startHour += 1) {
    const endHour = startHour + 1;
    const activeCourts = prepare.courts.filter(
      (court) => court.startHour <= startHour && court.endHour >= endHour,
    );
    if (activeCourts.length === 0) continue;

    const circularPairs = circularWithHide(
      prepare.players,
      startHour,
      endHour,
      startHour - prepare.maxRange.startHour,
    );
    const repairedPairs = pairingMissing(circularPairs, previousPairCounts);
    const availablePairs = repairedPairs.sort((first, second) => {
      const occupancy = second.length - first.length;
      if (occupancy !== 0) return occupancy;
      const firstPlayed = first.reduce((total, slot) => total + (playedHours.get(slot.player.id) ?? 0), 0);
      const secondPlayed = second.reduce((total, slot) => total + (playedHours.get(slot.player.id) ?? 0), 0);
      return firstPlayed - secondPlayed;
    });
    const paired = availablePairs.map((pair) => pair.map((slot) => slot.player));
    const pairedPlayerIds = new Set(paired.flatMap((pair) => pair.map((player) => player.id)));
    const courts = activeCourts.map((court) => ({
      courtId: court.id,
      courtName: court.name,
      paireds: [],
    }));

    for (const playerId of pairedPlayerIds) {
      playedHours.set(playerId, (playedHours.get(playerId) ?? 0) + 1);
    }
    for (const pair of availablePairs) {
      if (pair.length !== 2) continue;
      const key = pairKey(pair[0].player.id, pair[1].player.id);
      previousPairCounts.set(key, (previousPairCounts.get(key) ?? 0) + 1);
    }

    hours.push({
      startHour,
      endHour,
      courts,
      paired,
    });
  }

  return { hours };
}
