export function parseStartHour(value: unknown): number | null {
  if (typeof value !== "string" || !/^(?:[01]\d|2[0-3])$/.test(value)) return null;
  return Number(value);
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export type CourtTimeInterval = {
  id: string;
  start: number;
  end: number;
};

export function hasContinuousCourtOverlap(ranges: CourtTimeInterval[]): boolean {
  if (ranges.length < 2) return true;

  const sortedRanges = [...ranges].sort((left, right) => left.start - right.start || left.end - right.end);
  let connectedEnd = sortedRanges[0].end;

  for (const range of sortedRanges.slice(1)) {
    if (range.start >= connectedEnd) return false;
    connectedEnd = Math.max(connectedEnd, range.end);
  }

  return true;
}

function normalizeHour(hour: number): number {
  return ((hour % 24) + 24) % 24;
}

export function calculateCourtTimeRange(startHour: number, durationHours: number) {
  if (!Number.isInteger(startHour)) return null;
  if (!Number.isInteger(durationHours) || durationHours < 1) return null;

  const totalEndHour = startHour + durationHours;
  return {
    startTime: formatHour(normalizeHour(startHour)),
    startDaysLater: Math.floor(startHour / 24),
    endTime: formatHour(normalizeHour(totalEndHour)),
    endDaysLater: Math.floor(totalEndHour / 24),
  };
}
