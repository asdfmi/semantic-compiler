import { context, term, entity, valueObject, aggregate } from "../../packages/dsl/src/index.js";

const habit = entity({ name: "Habit", identity: "HabitId" });
const routine = entity({ name: "Routine", identity: "RoutineId" });

export default context({
  name: "habit",
  glossary: [
    term("Habit", "A recurring habit. Has frequency and a streak record"),
    term("Routine", "A sequence of steps forming a fixed procedure. Has schedule and frequency"),
    term("Frequency", "How often a habit is performed: daily, N times per week, or every N days"),
    term("Streak", "Consecutive completion record. Tracks current and longest counts"),
    term("Schedule", "Time of day for routine execution, expressed as HH:MM"),
    term("RoutineStep", "An individual step within a routine. Has order and estimated duration"),
  ],
  aggregates: [
    aggregate({
      name: "Habit",
      root: habit,
      valueObjects: [
        valueObject({ name: "Frequency" }),
        valueObject({ name: "Streak" }),
      ],
      invariants: [
        "Habit title must not be empty",
        "Streak currentCount >= 0",
        "Streak longestCount >= currentCount",
        "If currentCount > 0 then lastCompletedAt must not be null",
      ],
    }),
    aggregate({
      name: "Routine",
      root: routine,
      valueObjects: [
        valueObject({ name: "Frequency" }),
        valueObject({ name: "Schedule" }),
        valueObject({ name: "RoutineStep" }),
      ],
      invariants: [
        "Routine title must not be empty",
        "RoutineStep title must not be empty",
        "RoutineStep order >= 0",
        "Step order values must be unique",
      ],
    }),
  ],
});
