// ============================================================
// Result Type
// ============================================================

export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ ok: true, value }),
  err: <E>(error: E): Result<never, E> => ({ ok: false, error }),
} as const;

// ============================================================
// Brand Type Pattern
// ============================================================

declare const __brand: unique symbol;

/**
 * Branded type: attaches a type tag to a primitive to prevent mix-ups.
 */
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

// ============================================================
// Invariant Brand
// ============================================================

declare const __invariant: unique symbol;

/**
 * Ensures a type can only be constructed via its factory.
 * Object literals cannot satisfy the __invariant property, causing a compile error.
 */
export type Invariant<Tag extends string> = { readonly [__invariant]: Tag };

// ============================================================
// Branded IDs
// ============================================================

export type TaskId = Brand<string, "TaskId">;
export type TimeEntryId = Brand<string, "TimeEntryId">;
export type HabitId = Brand<string, "HabitId">;
export type RoutineId = Brand<string, "RoutineId">;
export type RoutineStepId = Brand<string, "RoutineStepId">;

// ============================================================
// Shared Value Objects
// ============================================================

/**
 * Timestamp in Unix epoch milliseconds.
 *
 * Invariant: ms >= 0
 */
export type Timestamp = Brand<number, "Timestamp">;

export const Timestamp = {
  now: (): Timestamp => Date.now() as Timestamp,
  from: (ms: number): Result<Timestamp> =>
    ms >= 0
      ? Result.ok(ms as Timestamp)
      : Result.err("Timestamp must be >= 0"),
} as const;
