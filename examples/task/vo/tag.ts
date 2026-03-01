import type { Invariant } from "../../shared/types.js";
import { Result } from "../../shared/types.js";

/**
 * Tag - A classification label for tasks.
 *
 * Invariant: value is non-empty after normalization (trim + lowercase).
 */
export type Tag = {
  readonly value: string;
} & Invariant<"Tag">;

export const Tag = {
  of: (raw: string): Result<Tag> => {
    const value = raw.trim().toLowerCase();
    return value.length > 0
      ? Result.ok({ value } as Tag)
      : Result.err("Tag must not be empty");
  },
  equals: (a: Tag, b: Tag): boolean => a.value === b.value,
} as const;
