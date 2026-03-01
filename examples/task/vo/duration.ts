import type { Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";

/**
 * Duration - A length of time in minutes.
 *
 * Invariant: minutes >= 0
 */
export type Duration = {
  readonly minutes: number;
} & Invariant<"Duration">;

export const Duration = {
  ofMinutes: (minutes: number): Result<Duration> =>
    minutes >= 0
      ? Result.ok({ minutes } as Duration)
      : Result.err("Duration minutes must be >= 0"),

  ofHours: (hours: number): Result<Duration> =>
    hours >= 0
      ? Result.ok({ minutes: hours * 60 } as Duration)
      : Result.err("Duration hours must be >= 0"),

  /** Zero is always valid. */
  zero: (): Duration => ({ minutes: 0 }) as Duration,

  /** Adding two valid Durations is always valid. */
  add: (a: Duration, b: Duration): Duration =>
    ({ minutes: a.minutes + b.minutes }) as Duration,
} as const;
