import type { Task } from "../entity/task.js";
import { Task as TaskEntity } from "../entity/task.js";
import type { TimeEntry } from "../entity/time-entry.js";
import type { TaskId, Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";
import { TaskStatus } from "../vo/task-status.js";
import type { Priority } from "../vo/priority.js";
import type { Tag } from "../vo/tag.js";
import { Duration } from "../vo/duration.js";
import type { Timestamp } from "../../shared/types.js";

/**
 * Task Aggregate Root
 *
 * Invariant:
 * - Every TimeEntry's taskId must match task.id
 */
export type TaskAggregate = {
  readonly task: Task;
  readonly timeEntries: readonly TimeEntry[];
} & Invariant<"TaskAggregate">;

export const TaskAggregate = {
  create: (task: Task, timeEntries: readonly TimeEntry[]): Result<TaskAggregate> => {
    const mismatch = timeEntries.find((e) => e.taskId !== task.id);
    if (mismatch) {
      return Result.err(
        `TimeEntry ${mismatch.id} has taskId ${mismatch.taskId}, expected ${task.id}`,
      );
    }
    return Result.ok({ task, timeEntries } as TaskAggregate);
  },

  /** Create a new task (status = Todo, timeEntries = empty). */
  new: (
    input: {
      title: string;
      description: string;
      priority: Priority;
      tags: readonly Tag[];
      estimatedDuration: Duration | null;
      dueAt: Timestamp | null;
    },
    deps: { generateId: () => TaskId },
  ): Result<TaskAggregate> => {
    const taskResult = TaskEntity.create({
      id: deps.generateId(),
      title: input.title,
      description: input.description,
      status: TaskStatus.Todo,
      priority: input.priority,
      tags: input.tags,
      estimatedDuration: input.estimatedDuration,
      dueAt: input.dueAt,
    });
    if (!taskResult.ok) return taskResult;
    return TaskAggregate.create(taskResult.value, []);
  },
} as const;

/**
 * Calculate total worked duration across all time entries.
 */
export function totalWorkedDuration(agg: TaskAggregate): Duration {
  return agg.timeEntries.reduce<Duration>((acc, entry) => {
    if (entry.endedAt === null) return acc;
    const diffMinutes = (entry.endedAt - entry.startedAt) / 60_000;
    const dur = Duration.ofMinutes(diffMinutes);
    if (!dur.ok) return acc;
    return Duration.add(acc, dur.value);
  }, Duration.zero());
}
