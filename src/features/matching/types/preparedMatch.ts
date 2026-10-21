/** Hour values are absolute on the session timeline; 24 means 00:00 on the following day. */
export type PreparedCourtSchedule = {
  id: string;
  name: string;
  bookedHours: number;
  startHour: number;
  endHour: number;
};

export type PreparedPlayerSchedule = {
  id: string;
  name: string;
  startHour: number;
  endHour: number;
};

/** Input snapshot from the preparation step. */
export type PreparedMatchRecord = {
  maxRange: {
    startHour: number;
    endHour: number;
    hours: number;
  };
  courts: PreparedCourtSchedule[];
  players: PreparedPlayerSchedule[];
};
