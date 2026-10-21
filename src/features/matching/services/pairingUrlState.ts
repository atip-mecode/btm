import type { ActionResult } from "@/lib/actionResult";
import type { PairingResult, Player } from "@/features/matching/types/pairingResult";

type DecodeErrorCode = "INVALID_MATCH_STATE";

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
  return Array.isArray(value)
    && value.length >= 1
    && value.length <= 2
    && value.every(isPlayer);
}

function isCourt(value: unknown): boolean {
  return isRecord(value)
    && typeof value.courtId === "string"
    && typeof value.courtName === "string"
    && Array.isArray(value.paireds)
    && value.paireds.every(isPair);
}

function isHour(value: unknown): boolean {
  return isRecord(value)
    && typeof value.startHour === "number"
    && typeof value.endHour === "number"
    && Number.isInteger(value.startHour)
    && value.endHour === value.startHour + 1
    && Array.isArray(value.courts)
    && value.courts.every(isCourt)
    && Array.isArray(value.paired)
    && value.paired.every(isPair);
}

function isPairingResult(value: unknown): value is PairingResult {
  return isRecord(value)
    && Array.isArray(value.hours)
    && value.hours.every(isHour);
}

/** Encode a completed match as UTF-8 JSON in a URL-safe, versioned string. */
export function encodePairingResult(result: PairingResult): string {
  const bytes = new TextEncoder().encode(JSON.stringify({ version: 3, result }));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** Decode and validate the state from a shareable /match URL. */
export function decodePairingResult(state: string | null): ActionResult<PairingResult, DecodeErrorCode> {
  const invalid = (): ActionResult<PairingResult, DecodeErrorCode> => ({
    success: false,
    error: { code: "INVALID_MATCH_STATE", message: "ลิงก์ผลจับคู่ไม่ถูกต้องหรือข้อมูลไม่ครบ" },
  });
  if (!state || !/^[A-Za-z0-9_-]+$/.test(state)) return invalid();

  try {
    const base64 = state.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    const decoded: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!isRecord(decoded) || decoded.version !== 3 || !isPairingResult(decoded.result)) return invalid();
    return { success: true, data: decoded.result };
  } catch {
    return invalid();
  }
}
