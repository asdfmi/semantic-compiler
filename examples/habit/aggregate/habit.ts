import type { Habit } from "../entity/habit.js";
import { Habit as HabitEntity } from "../entity/habit.js";
import { Streak } from "../vo/streak.js";
import type { Frequency } from "../vo/frequency.js";
import type { HabitId, Timestamp, Invariant, Result } from "../../shared/types.js";

/**
 * Habit Aggregate Root
 */
export type HabitAggregate = {
  readonly habit: Habit;
} & Invariant<"HabitAggregate">;

export const HabitAggregate = {
  /** Create a new habit (streak = empty, isActive = true). */
  new: (
    input: {
      title: string;
      description: string;
      frequency: Frequency;
    },
    deps: { generateId: () => HabitId },
  ): Result<HabitAggregate> => {
    const habitResult = HabitEntity.create({
      id: deps.generateId(),
      title: input.title,
      description: input.description,
      frequency: input.frequency,
      streak: Streak.empty(),
      isActive: true,
    });
    if (!habitResult.ok) return habitResult;
    return { ok: true, value: { habit: habitResult.value } as HabitAggregate };
  },
} as const;

/**
 * Record the habit as completed and update the streak.
 */
export function completeHabit(
  agg: HabitAggregate,
  completedAt: Timestamp,
): HabitAggregate {
  return {
    ...agg,
    habit: {
      ...agg.habit,
      streak: Streak.increment(agg.habit.streak, completedAt),
    },
  };
}

/**
 * Reset the streak (e.g. when the deadline has passed).
 */
export function resetStreak(agg: HabitAggregate): HabitAggregate {
  return {
    ...agg,
    habit: {
      ...agg.habit,
      streak: Streak.reset(agg.habit.streak),
    },
  };
}
