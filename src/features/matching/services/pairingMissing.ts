import type { PairCandidate, Ready } from "@/features/matching/types/pairingCandidate";

type FilledPair<Player> = readonly [Ready<Player>] | readonly [Ready<Player>, Ready<Player>];

export function pairKey(firstId: string, secondId: string): string {
  return [firstId, secondId].sort().join("\u0000");
}

/** Consolidate ready players from incomplete pairs; an unavoidable remainder stays as one player. */
export function pairingMissing<Player extends { id: string }>(
  candidates: readonly PairCandidate<Player>[],
  previousPairCounts: ReadonlyMap<string, number> = new Map(),
): FilledPair<Player>[] {
  const complete: FilledPair<Player>[] = [];
  const singles: Ready<Player>[] = [];

  for (const [first, second] of candidates) {
    if (first.kind === "ready" && second.kind === "ready") {
      complete.push([first, second]);
    } else {
      if (first.kind === "ready") singles.push(first);
      if (second.kind === "ready") singles.push(second);
    }
  }

  const repaired: FilledPair<Player>[] = [...complete];
  while (singles.length > 1) {
    const first = singles.shift();
    if (!first) break;

    let partnerIndex = 0;
    for (let index = 1; index < singles.length; index += 1) {
      const candidateCount = previousPairCounts.get(pairKey(first.player.id, singles[index].player.id)) ?? 0;
      const bestCount = previousPairCounts.get(pairKey(first.player.id, singles[partnerIndex].player.id)) ?? 0;
      if (candidateCount < bestCount) partnerIndex = index;
    }
    const [second] = singles.splice(partnerIndex, 1);
    repaired.push([first, second]);
  }

  if (singles.length === 1) repaired.push([singles[0]]);
  return repaired;
}
