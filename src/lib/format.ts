import { formatShortDate } from "@merqo/ui";

// Vercel runs server components in UTC, so a bare toLocaleString() renders the
// wrong wall-clock time for a Singapore vendor. Pin grouping keys to
// Asia/Singapore (SGT, UTC+8). Display formatting lives in @merqo/ui.
const SGT = "Asia/Singapore";

/** e.g. "2026-07-10" — SGT calendar-day key for grouping/bucketing. */
export function sgtDateKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: SGT });
}

export { formatShortDate };
