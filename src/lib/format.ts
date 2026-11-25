// Vercel runs server components in UTC, so a bare toLocaleString() renders the
// wrong wall-clock time for a Singapore vendor. Pin grouping keys to
// Asia/Singapore (SGT, UTC+8). Display formatting lives in @merqo/ui.
const SGT = "Asia/Singapore";

/** e.g. "2026-07-10" — SGT calendar-day key for grouping/bucketing. */
export function sgtDateKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: SGT });
}

/** e.g. "10 Jul" — short day+month label for a "YYYY-MM-DD" date key, for
 * chart axis labels. Formatted in UTC since the key is already an SGT
 * calendar day; re-applying SGT here could shift it across midnight. */
export function formatShortDate(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString("en-SG", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  });
}
