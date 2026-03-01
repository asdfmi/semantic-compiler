import type { Timestamp, Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";

/**
 * Streak - Consecutive completion record.
 *
 * Invariants:
 * - currentCount >= 0
 * - longestCount >= currentCount
 * - If currentCount > 0 then lastCompletedAt must not be null
 */
export type Streak = {
  readonly currentCount: number;
  readonly longestCount: number;
  readonly lastCompletedAt: Timestamp | null;
} & Invariant<"Streak">;

export const Streak = {
  empty: (): Streak =>
    ({
      currentCount: 0,
      longestCount: 0,
      lastCompletedAt: null,
    }) as Streak,

  create: (params: {
    currentCount: number;
    longestCount: number;
    lastCompletedAt: Timestamp | null;
  }): Result<Streak> => {
    if (params.currentCount < 0) {
      return Result.err("Streak currentCount must be >= 0");
    }
    if (params.longestCount < params.currentCount) {
      return Result.err("Streak longestCount must be >= currentCount");
    }
    if (params.currentCount > 0 && params.lastCompletedAt === null) {
      return Result.err(
        "Streak lastCompletedAt is required when currentCount > 0",
      );
    }
    return Result.ok(params as Streak);
  },

  /** Incrementing a valid Streak is always valid. */
  increment: (streak: Streak, completedAt: Timestamp): Streak => {
    const next = streak.currentCount + 1;
    return {
      currentCount: next,
      longestCount: Math.max(streak.longestCount, next),
      lastCompletedAt: completedAt,
    } as Streak;
  },

  /** Resetting a valid Streak is always valid. */
  reset: (streak: Streak): Streak =>
    ({
      currentCount: 0,
      longestCount: streak.longestCount,
      lastCompletedAt: streak.lastCompletedAt,
    }) as Streak,
} as const;
