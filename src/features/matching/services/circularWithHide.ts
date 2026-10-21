import type { PreparedPlayerSchedule } from "@/features/matching/types/preparedMatch";
import type { NotReady, PairCandidate, Ready } from "@/features/matching/types/pairingCandidate";

/** One circle-method round. Unavailable players stay in the circle as not-ready slots. */
export function circularWithHide(
  players: readonly PreparedPlayerSchedule[],
  startHour: number,
  endHour: number,
  round: number,
): PairCandidate<PreparedPlayerSchedule>[] {
  if (players.length === 0) return [];

  const circle: (PreparedPlayerSchedule | null)[] = players.length % 2 === 0
    ? [...players]
    : [...players, null];
  const [anchor, ...rotating] = circle;
  const offset = round % rotating.length;
  const rotated = offset === 0
    ? rotating
    : [...rotating.slice(-offset), ...rotating.slice(0, -offset)];
  const ordered = [anchor, ...rotated];

  function visibility(player: PreparedPlayerSchedule | null): Ready<PreparedPlayerSchedule> | NotReady<PreparedPlayerSchedule> {
    if (player && player.startHour <= startHour && player.endHour >= endHour) {
      return { kind: "ready", player };
    }
    return { kind: "not_ready", player };
  }

  return Array.from({ length: ordered.length / 2 }, (_, index) => [
    visibility(ordered[index]),
    visibility(ordered[ordered.length - 1 - index]),
  ]);
}
