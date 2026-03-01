import type { RoutineStepId, Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";
import type { Duration } from "../../task/vo/duration.js";

/**
 * RoutineStep - An individual step within a routine.
 *
 * Invariants:
 * - title must not be empty
 * - order >= 0
 */
export type RoutineStep = {
  readonly id: RoutineStepId;
  readonly title: string;
  readonly order: number;
  readonly estimatedDuration: Duration | null;
} & Invariant<"RoutineStep">;

export const RoutineStep = {
  create: (params: {
    id: RoutineStepId;
    title: string;
    order: number;
    estimatedDuration: Duration | null;
  }): Result<RoutineStep> => {
    if (params.title.trim().length === 0) {
      return Result.err("RoutineStep title must not be empty");
    }
    if (params.order < 0) {
      return Result.err("RoutineStep order must be >= 0");
    }
    return Result.ok(params as RoutineStep);
  },
} as const;
