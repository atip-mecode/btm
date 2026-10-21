export function parseStartHour(value: unknown): number | null {
  if (typeof value !== "string" || !/^(?:[01]\d|2[0-3])$/.test(value)) return null;
  return Number(value);
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function calculateCourtEndTime(startHour: number, durationHours: number) {
  if (!Number.isInteger(startHour) || startHour < 0 || startHour > 23) return null;
  if (!Number.isInteger(durationHours) || durationHours < 1) return null;

  const totalEndHour = startHour + durationHours;
  return {
    time: formatHour(totalEndHour % 24),
    daysLater: Math.floor(totalEndHour / 24),
  };
}
