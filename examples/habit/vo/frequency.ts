import type { Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";

/**
 * Frequency - How often a habit is performed.
 *
 * Invariants:
 * - weekly: daysOfWeek must not be empty
 * - interval: everyNDays >= 1
 */
export type Frequency = (
  | { readonly kind: "daily" }
  | { readonly kind: "weekly"; readonly daysOfWeek: readonly DayOfWeek[] }
  | { readonly kind: "interval"; readonly everyNDays: number }
) & Invariant<"Frequency">;

export const DayOfWeek = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const Frequency = {
  daily: (): Frequency => ({ kind: "daily" }) as Frequency,

  weekly: (days: readonly DayOfWeek[]): Result<Frequency> =>
    days.length > 0
      ? Result.ok({ kind: "weekly" as const, daysOfWeek: days } as Frequency)
      : Result.err("Frequency weekly requires at least one day"),

  everyNDays: (n: number): Result<Frequency> =>
    n >= 1
      ? Result.ok({ kind: "interval" as const, everyNDays: n } as Frequency)
      : Result.err("Frequency everyNDays must be >= 1"),
} as const;
