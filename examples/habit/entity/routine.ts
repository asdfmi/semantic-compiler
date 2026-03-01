import type { RoutineId, Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";
import type { Frequency } from "../vo/frequency.js";
import type { Schedule } from "../vo/schedule.js";

/**
 * Routine Entity
 *
 * Invariant:
 * - title must not be empty
 */
export type Routine = {
  readonly id: RoutineId;
  readonly title: string;
  readonly description: string;
  readonly frequency: Frequency;
  readonly schedule: Schedule | null;
  readonly isActive: boolean;
} & Invariant<"Routine">;

export const Routine = {
  create: (params: {
    id: RoutineId;
    title: string;
    description: string;
    frequency: Frequency;
    schedule: Schedule | null;
    isActive: boolean;
  }): Result<Routine> => {
    if (params.title.trim().length === 0) {
      return Result.err("Routine title must not be empty");
    }
    return Result.ok(params as Routine);
  },
} as const;
