/**
 * Priority - Eisenhower Matrix based priority levels.
 *
 * urgent_important:         Do it now
 * not_urgent_important:     Schedule it
 * urgent_not_important:     Delegate it
 * not_urgent_not_important: Consider dropping it
 */
export const Priority = {
  UrgentImportant: "urgent_important",
  NotUrgentImportant: "not_urgent_important",
  UrgentNotImportant: "urgent_not_important",
  NotUrgentNotImportant: "not_urgent_not_important",
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];
