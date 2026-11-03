/**
 * Whether a cached merqo entitlement row grants Pro right now. Merqo has no
 * cron to push a lapse, so expiry is evaluated here at read time. A null
 * `valid_until` on a paid row is a legacy carry-over and stays open until
 * merqo's next push. Mirrors `loopkit.is_pro` (migration 0067).
 */
export function isPaidEntitlement(
  row: { tier: string; valid_until: string | null } | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!row || row.tier !== "paid") return false;
  return (
    row.valid_until === null || Date.parse(row.valid_until) > now.getTime()
  );
}
