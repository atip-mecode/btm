import type { PairCandidate } from "@/features/matching/types/pairingCandidate";

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

/** Shuffle circle rounds, then shuffle the pair order inside each round. */
export function shuffleCircularPermutations<Player>(
  permutations: readonly (readonly PairCandidate<Player>[])[],
  random: () => number = Math.random,
): PairCandidate<Player>[][] {
  return shuffle(permutations, random).map((permutation) => shuffle(permutation, random));
}
