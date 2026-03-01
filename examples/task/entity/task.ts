import type { TaskId, Timestamp, Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";
import type { TaskStatus } from "../vo/task-status.js";
import type { Priority } from "../vo/priority.js";
import type { Duration } from "../vo/duration.js";
import type { Tag } from "../vo/tag.js";

/**
 * Task Entity
 *
 * A finite piece of work that can be completed.
 *
 * Invariant:
 * - title must not be empty
 */
export type Task = {
  readonly id: TaskId;
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly priority: Priority;
  readonly tags: readonly Tag[];
  readonly estimatedDuration: Duration | null;
  readonly dueAt: Timestamp | null;
} & Invariant<"Task">;

export const Task = {
  create: (params: {
    id: TaskId;
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    tags: readonly Tag[];
    estimatedDuration: Duration | null;
    dueAt: Timestamp | null;
  }): Result<Task> => {
    if (params.title.trim().length === 0) {
      return Result.err("Task title must not be empty");
    }
    return Result.ok(params as Task);
  },
} as const;
