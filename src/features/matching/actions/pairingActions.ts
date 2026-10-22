import { circularWithHide } from "@/features/matching/services/circularWithHide";
import { pairKey, pairingMissing } from "@/features/matching/services/pairingMissing";
import type { PairCandidate } from "@/features/matching/types/pairingCandidate";
import type { PreparedMatchRecord } from "@/features/matching/types/preparedMatch";
import type { HourlyPairing, PairingResult } from "@/features/matching/types/pairingResult";

function shuffle<T>(values: readonly T[]): T[] {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function pairCandidateOrder<Player>(candidates: readonly PairCandidate<Player>[]): PairCandidate<Player>[] {
  return shuffle(candidates);
}

/** Build hourly pairings from one shuffled circular round order. */
export function createPairingResult(prepare: PreparedMatchRecord): PairingResult {
  const playedHours = new Map<string, number>();
  const previousPairCounts = new Map<string, number>();
  const circleRoundCount = Math.max(0, prepare.players.length - 1);
  const roundOrder = shuffle(Array.from({ length: circleRoundCount }, (_, round) => round));
  const hours: HourlyPairing[] = [];
  let activeHourIndex = 0;

  for (let startHour = prepare.maxRange.startHour; startHour < prepare.maxRange.endHour; startHour += 1) {
    const endHour = startHour + 1;
    const activeCourts = prepare.courts.filter(
      (court) => court.startHour <= startHour && court.endHour >= endHour,
    );
    if (activeCourts.length === 0) continue;

    const roundIndex = roundOrder.length > 0 ? roundOrder[activeHourIndex % roundOrder.length] : null;
    const candidates = roundIndex === null
      ? []
      : pairCandidateOrder(circularWithHide(prepare.players, startHour, endHour, roundIndex));
    const repairedPairs = pairingMissing(candidates, previousPairCounts);
    const pairedWithPlayerHours = repairedPairs.sort((first, second) => {
      const occupancy = second.length - first.length;
      if (occupancy !== 0) return occupancy;
      const firstPlayed = first.reduce((total, slot) => total + (playedHours.get(slot.player.id) ?? 0), 0);
      const secondPlayed = second.reduce((total, slot) => total + (playedHours.get(slot.player.id) ?? 0), 0);
      return firstPlayed - secondPlayed;
    });
    const paired = pairedWithPlayerHours.map((pair) => pair.map((slot) => slot.player));
    const pairedPlayerIds = new Set(paired.flatMap((pair) => pair.map((player) => player.id)));
    const courts = activeCourts.map((court) => ({
      courtId: court.id,
      courtName: court.name,
      paireds: [],
    }));

    for (const playerId of pairedPlayerIds) {
      playedHours.set(playerId, (playedHours.get(playerId) ?? 0) + 1);
    }
    for (const pair of pairedWithPlayerHours) {
      if (pair.length !== 2) continue;
      const key = pairKey(pair[0].player.id, pair[1].player.id);
      previousPairCounts.set(key, (previousPairCounts.get(key) ?? 0) + 1);
    }

    hours.push({ startHour, endHour, courts, paired });
    activeHourIndex += 1;
  }

  return { prepare, hours };
}
