import type { HabitId, Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";
import type { Frequency } from "../vo/frequency.js";
import type { Streak } from "../vo/streak.js";

/**
 * Habit Entity
 *
 * Invariant:
 * - title must not be empty
 */
export type Habit = {
  readonly id: HabitId;
  readonly title: string;
  readonly description: string;
  readonly frequency: Frequency;
  readonly streak: Streak;
  readonly isActive: boolean;
} & Invariant<"Habit">;

export const Habit = {
  create: (params: {
    id: HabitId;
    title: string;
    description: string;
    frequency: Frequency;
    streak: Streak;
    isActive: boolean;
  }): Result<Habit> => {
    if (params.title.trim().length === 0) {
      return Result.err("Habit title must not be empty");
    }
    return Result.ok(params as Habit);
  },
} as const;
