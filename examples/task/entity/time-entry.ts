import type { TimeEntryId, TaskId, Timestamp, Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";

/**
 * TimeEntry Entity
 *
 * A work session recorded against a task.
 *
 * Invariant:
 * - If endedAt is present, endedAt > startedAt
 */
export type TimeEntry = {
  readonly id: TimeEntryId;
  readonly taskId: TaskId;
  readonly startedAt: Timestamp;
  readonly endedAt: Timestamp | null;
  readonly note: string;
} & Invariant<"TimeEntry">;

export const TimeEntry = {
  create: (params: {
    id: TimeEntryId;
    taskId: TaskId;
    startedAt: Timestamp;
    endedAt: Timestamp | null;
    note: string;
  }): Result<TimeEntry> => {
    if (params.endedAt !== null && params.endedAt <= params.startedAt) {
      return Result.err("TimeEntry endedAt must be after startedAt");
    }
    return Result.ok(params as TimeEntry);
  },

  /** Start a new work session (endedAt = null). */
  start: (
    input: { taskId: TaskId; startedAt: Timestamp; note: string },
    deps: { generateId: () => TimeEntryId },
  ): Result<TimeEntry> =>
    TimeEntry.create({
      id: deps.generateId(),
      taskId: input.taskId,
      startedAt: input.startedAt,
      endedAt: null,
      note: input.note,
    }),
} as const;
