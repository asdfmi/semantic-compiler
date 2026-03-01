/**
 * TaskStatus - State transitions for a task.
 *
 * todo -> in_progress -> done
 *              |
 *          cancelled
 */
export const TaskStatus = {
  Todo: "todo",
  InProgress: "in_progress",
  Done: "done",
  Cancelled: "cancelled",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
