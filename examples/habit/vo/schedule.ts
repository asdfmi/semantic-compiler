import type { Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";

/**
 * Schedule - Time of day for a routine execution.
 *
 * Invariants:
 * - hour: 0 <= hour <= 23
 * - minute: 0 <= minute <= 59
 */
export type Schedule = {
  readonly hour: number;
  readonly minute: number;
} & Invariant<"Schedule">;

export const Schedule = {
  of: (hour: number, minute: number): Result<Schedule> => {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      return Result.err("Schedule hour must be an integer 0-23");
    }
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      return Result.err("Schedule minute must be an integer 0-59");
    }
    return Result.ok({ hour, minute } as Schedule);
  },

  parse: (time: string): Result<Schedule> => {
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      return Result.err("Schedule must be in HH:MM format");
    }
    return Schedule.of(Number(match[1]), Number(match[2]));
  },

  format: (s: Schedule): string =>
    `${String(s.hour).padStart(2, "0")}:${String(s.minute).padStart(2, "0")}`,
} as const;
