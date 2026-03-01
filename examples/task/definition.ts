import { context, term, entity, valueObject, aggregate } from "../../packages/dsl/src/index.js";

const task = entity({ name: "Task", identity: "TaskId" });
const timeEntry = entity({ name: "TimeEntry", identity: "TimeEntryId" });

export default context({
  name: "task",
  glossary: [
    term("Task", "A finite piece of work. Has completion, priority, and a due date"),
    term("TimeEntry", "A work session recorded against a task. Has start and end times"),
    term("Priority", "Four-level priority based on the Eisenhower Matrix"),
    term("Duration", "A length of time in minutes. Used for estimates and actuals"),
    term("Tag", "A classification label for tasks. Normalized for uniqueness"),
  ],
  aggregates: [
    aggregate({
      name: "Task",
      root: task,
      entities: [timeEntry],
      valueObjects: [
        valueObject({ name: "TaskStatus" }),
        valueObject({ name: "Priority" }),
        valueObject({ name: "Duration" }),
        valueObject({ name: "Tag" }),
      ],
      invariants: [
        "Task title must not be empty",
        "If TimeEntry endedAt is present, endedAt > startedAt",
        "Every TimeEntry's taskId must match Task.id",
      ],
    }),
  ],
});
