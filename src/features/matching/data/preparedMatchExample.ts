import type { PreparedMatchRecord } from "@/features/matching/types/preparedMatch";

/** Example snapshot from Prepare: overlapping courts and 12 players with different availabilities. */
export const preparedMatchExample: PreparedMatchRecord = {
  maxRange: {
    startHour: 18,
    endHour: 22,
    hours: 4,
  },
  courts: [
    { id: "court-odt9", name: "Court ODT9", bookedHours: 3, startHour: 18, endHour: 21 },
    { id: "court-blue", name: "Court Blue", bookedHours: 3, startHour: 19, endHour: 22 },
    { id: "court-green", name: "Court Green", bookedHours: 2, startHour: 20, endHour: 22 },
  ],
  players: [
    { id: "player-01", name: "ผู้เล่น 01", startHour: 18, endHour: 22 },
    { id: "player-02", name: "ผู้เล่น 02", startHour: 18, endHour: 22 },
    { id: "player-03", name: "ผู้เล่น 03", startHour: 18, endHour: 21 },
    { id: "player-04", name: "ผู้เล่น 04", startHour: 18, endHour: 21 },
    { id: "player-05", name: "ผู้เล่น 05", startHour: 19, endHour: 22 },
    { id: "player-06", name: "ผู้เล่น 06", startHour: 19, endHour: 22 },
    { id: "player-07", name: "ผู้เล่น 07", startHour: 18, endHour: 20 },
    { id: "player-08", name: "ผู้เล่น 08", startHour: 20, endHour: 22 },
    { id: "player-09", name: "ผู้เล่น 09", startHour: 19, endHour: 21 },
    { id: "player-10", name: "ผู้เล่น 10", startHour: 18, endHour: 22 },
    { id: "player-11", name: "ผู้เล่น 11", startHour: 20, endHour: 22 },
    { id: "player-12", name: "ผู้เล่น 12", startHour: 18, endHour: 21 },
  ],
};
