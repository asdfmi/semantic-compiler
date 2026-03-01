import type { Routine } from "../entity/routine.js";
import { Routine as RoutineEntity } from "../entity/routine.js";
import type { RoutineStep } from "../vo/routine-step.js";
import { RoutineStep as RoutineStepVO } from "../vo/routine-step.js";
import type { RoutineId, RoutineStepId, Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";
import type { Frequency } from "../vo/frequency.js";
import type { Schedule } from "../vo/schedule.js";
import { Duration } from "../../task/vo/duration.js";

/**
 * Routine Aggregate Root
 *
 * Invariant:
 * - Step order values must be unique
 */
export type RoutineAggregate = {
  readonly routine: Routine;
  readonly steps: readonly RoutineStep[];
} & Invariant<"RoutineAggregate">;

export const RoutineAggregate = {
  create: (
    routine: Routine,
    steps: readonly RoutineStep[],
  ): Result<RoutineAggregate> => {
    const orders = steps.map((s) => s.order);
    const unique = new Set(orders);
    if (unique.size !== orders.length) {
      return Result.err("RoutineAggregate steps must have unique order values");
    }
    return Result.ok({ routine, steps } as RoutineAggregate);
  },

  /** Create a new routine (isActive = true, order assigned by array index). */
  new: (
    input: {
      title: string;
      description: string;
      frequency: Frequency;
      schedule: Schedule | null;
      steps: readonly { title: string; estimatedDuration: Duration | null }[];
    },
    deps: {
      generateRoutineId: () => RoutineId;
      generateStepId: () => RoutineStepId;
    },
  ): Result<RoutineAggregate> => {
    const routineResult = RoutineEntity.create({
      id: deps.generateRoutineId(),
      title: input.title,
      description: input.description,
      frequency: input.frequency,
      schedule: input.schedule,
      isActive: true,
    });
    if (!routineResult.ok) return routineResult;

    const steps: RoutineStep[] = [];
    for (let i = 0; i < input.steps.length; i++) {
      const s = input.steps[i];
      const stepResult = RoutineStepVO.create({
        id: deps.generateStepId(),
        title: s.title,
        order: i,
        estimatedDuration: s.estimatedDuration,
      });
      if (!stepResult.ok) return stepResult;
      steps.push(stepResult.value);
    }

    return RoutineAggregate.create(routineResult.value, steps);
  },
} as const;

/**
 * Calculate total estimated duration across all steps.
 */
export function totalEstimatedDuration(agg: RoutineAggregate): Duration {
  return agg.steps.reduce<Duration>((acc, step) => {
    if (step.estimatedDuration === null) return acc;
    return Duration.add(acc, step.estimatedDuration);
  }, Duration.zero());
}
