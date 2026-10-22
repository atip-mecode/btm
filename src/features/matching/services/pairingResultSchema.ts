import type { PairingResult, Player } from "@/features/matching/types/pairingResult";
import type { PreparedMatchRecord } from "@/features/matching/types/preparedMatch";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlayer(value: unknown): value is Player {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.name === "string"
    && typeof value.startHour === "number"
    && typeof value.endHour === "number"
    && Number.isInteger(value.startHour)
    && Number.isInteger(value.endHour);
}

function isPair(value: unknown): value is Player[] {
  return Array.isArray(value) && value.length >= 1 && value.length <= 2 && value.every(isPlayer);
}

function isPreparedMatchRecord(value: unknown): value is PreparedMatchRecord {
  return isRecord(value)
    && isRecord(value.maxRange)
    && Number.isInteger(value.maxRange.startHour)
    && Number.isInteger(value.maxRange.endHour)
    && Number.isInteger(value.maxRange.hours)
    && Array.isArray(value.courts)
    && value.courts.every((court) => isRecord(court)
      && typeof court.id === "string"
      && typeof court.name === "string"
      && Number.isInteger(court.bookedHours)
      && Number.isInteger(court.startHour)
      && Number.isInteger(court.endHour))
    && Array.isArray(value.players)
    && value.players.every(isPlayer);
}

function isHour(value: unknown): boolean {
  return isRecord(value)
    && typeof value.startHour === "number"
    && typeof value.endHour === "number"
    && Number.isInteger(value.startHour)
    && value.endHour === value.startHour + 1
    && Array.isArray(value.courts)
    && value.courts.every((court) => isRecord(court)
      && typeof court.courtId === "string"
      && typeof court.courtName === "string"
      && Array.isArray(court.paireds)
      && court.paireds.every(isPair))
    && Array.isArray(value.paired)
    && value.paired.every(isPair);
}

function isPairingResultShape(value: unknown): value is PairingResult {
  return isRecord(value)
    && Array.isArray(value.hours)
    && value.hours.every(isHour)
    && (value.prepare === undefined || isPreparedMatchRecord(value.prepare));
}

export function isPairingResult(value: unknown): value is PairingResult {
  return isPairingResultShape(value);
}

/** Drop the legacy display option from results saved before it moved to the room. */
export function parsePairingResult(value: unknown): PairingResult | null {
  if (!isPairingResult(value)) return null;
  return {
    hours: value.hours,
    ...(value.prepare === undefined ? {} : { prepare: value.prepare }),
  };
}
