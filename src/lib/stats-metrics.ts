import { sgtDateKey } from "@/lib/format";
import { isWonVisit } from "@/lib/metrics";
import { MS_PER_DAY } from "@/lib/time";
import type { StatsEvent } from "./stats-types";

// Splits raw stamp_events into the two buckets every stat in this module is
// built from. `regen` (card regeneration) events land in neither — they are
// not a customer action.
export function classifyActivity(events: StatsEvent[]): {
  activityEvents: StatsEvent[];
  rewardEvents: StatsEvent[];
} {
  const activityEvents = events.filter(
    (e) => e.kind === "stamp" || e.kind === "visit",
  );
  const rewardEvents = events.filter(
    (e) => e.kind === "redeem" || isWonVisit(e),
  );
  return { activityEvents, rewardEvents };
}

// Percent change of current vs prior. null when prior is 0 — growth from
// nothing is undefined; the UI shows "—", never Infinity/NaN.
export function pctChange(current: number, prior: number): number | null {
  if (prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

// Always 30 entries (oldest first, today last), zero-filled for days with no
// activity — callers can render a fixed-width bar strip with no gap logic.
export function bucketVisitsByDay(
  activityEvents: { created_at: string }[],
  nowMs: number,
): { date: string; count: number }[] {
  const countByDay = new Map<string, number>();
  for (const e of activityEvents) {
    const key = sgtDateKey(e.created_at);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  const days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const key = sgtDateKey(new Date(nowMs - i * MS_PER_DAY).toISOString());
    days.push({ date: key, count: countByDay.get(key) ?? 0 });
  }
  return days;
}

// Average days between a repeat customer's consecutive visits, pooled
// across every card with 2+ activity events. null when no card in the
// program has repeated yet — the UI shows "—", not a misleading 0.
export function avgDaysBetweenVisits(
  activityEvents: StatsEvent[],
): number | null {
  const byCard = new Map<string, number[]>();
  for (const e of activityEvents) {
    const t = Date.parse(e.created_at);
    if (!Number.isFinite(t)) continue;
    const arr = byCard.get(e.card_id) ?? [];
    arr.push(t);
    byCard.set(e.card_id, arr);
  }

  const gapsDays: number[] = [];
  for (const timestamps of byCard.values()) {
    if (timestamps.length < 2) continue;
    timestamps.sort((a, b) => a - b);
    for (let i = 1; i < timestamps.length; i++) {
      gapsDays.push((timestamps[i] - timestamps[i - 1]) / MS_PER_DAY);
    }
  }
  if (gapsDays.length === 0) return null;
  return gapsDays.reduce((sum, g) => sum + g, 0) / gapsDays.length;
}

// Of cards active in the last 90 days (latest activity event within the
// window), the fraction that have 2 or more lifetime activity events. This
// is the vendor-facing "% come back" headline. The denominator is
// 90-day-active cards, not all-time enrolled: a long-dead card is not
// evidence the program stopped working, so it must not drag the rate down.
// null when no card is 90-day-active (mirrors avgDaysBetweenVisits' null
// convention: no signal, not a misleading 0).
export function returnRate90d(
  activityEvents: StatsEvent[],
  nowMs: number,
): number | null {
  const cutoff90 = nowMs - 90 * MS_PER_DAY;
  const byCard = new Map<string, { total: number; latest: number }>();
  for (const e of activityEvents) {
    const t = Date.parse(e.created_at);
    if (!Number.isFinite(t)) continue;
    const cur = byCard.get(e.card_id) ?? { total: 0, latest: 0 };
    cur.total += 1;
    if (t > cur.latest) cur.latest = t;
    byCard.set(e.card_id, cur);
  }

  let active = 0;
  let returners = 0;
  for (const { total, latest } of byCard.values()) {
    if (latest < cutoff90) continue;
    active += 1;
    if (total >= 2) returners += 1;
  }
  return active === 0 ? null : returners / active;
}

// Cards worth a win-back nudge: 3 or more lifetime activity events (a real
// regular, not a one-time visitor) whose latest event is 21 to 40 days ago.
// The window is bounded on both sides: under 21 days is still recent, past
// roughly 45 days the customer has usually churned and the nudge is low-ROI.
// cardIds follow first-seen order in the input.
export function regularsGoneQuiet(
  activityEvents: StatsEvent[],
  nowMs: number,
): { count: number; cardIds: string[] } {
  const earliest = nowMs - 40 * MS_PER_DAY;
  const latestCutoff = nowMs - 21 * MS_PER_DAY;
  const byCard = new Map<string, { total: number; latest: number }>();
  const order: string[] = [];
  for (const e of activityEvents) {
    const t = Date.parse(e.created_at);
    if (!Number.isFinite(t)) continue;
    let cur = byCard.get(e.card_id);
    if (!cur) {
      cur = { total: 0, latest: 0 };
      byCard.set(e.card_id, cur);
      order.push(e.card_id);
    }
    cur.total += 1;
    if (t > cur.latest) cur.latest = t;
  }

  const cardIds: string[] = [];
  for (const id of order) {
    const { total, latest } = byCard.get(id)!;
    if (total >= 3 && latest >= earliest && latest < latestCutoff) {
      cardIds.push(id);
    }
  }
  return { count: cardIds.length, cardIds };
}

// How many cards are one or two stamps short of the reward. The one-away
// count is the hottest win the vendor has: a near-certain next visit at
// almost zero marginal cost. A card at or past the threshold is
// reward-ready, a separate state, and is not counted here.
export function cardsNearReward(
  cards: { stamp_count: number }[],
  stampsRequired: number,
): { oneAway: number; twoAway: number } {
  let oneAway = 0;
  let twoAway = 0;
  for (const c of cards) {
    if (c.stamp_count === stampsRequired - 1) oneAway += 1;
    else if (c.stamp_count === stampsRequired - 2) twoAway += 1;
  }
  return { oneAway, twoAway };
}

// Epoch ms of 00:00 on the 1st of nowMs's calendar month, in SGT (UTC+8).
export function sgtMonthStart(nowMs: number): number {
  const sgt = new Date(nowMs + 8 * 60 * 60 * 1000);
  return (
    Date.UTC(sgt.getUTCFullYear(), sgt.getUTCMonth(), 1) - 8 * 60 * 60 * 1000
  );
}

// The spec's "Regular": a card with 2 or more lifetime activity events AND an
// event in the last 30 days. Both conditions, not either.
export function countRegulars(
  activityEvents: StatsEvent[],
  nowMs: number,
): number {
  const cutoff30 = nowMs - 30 * MS_PER_DAY;
  const byCard = new Map<string, { total: number; recent: boolean }>();
  for (const e of activityEvents) {
    const t = Date.parse(e.created_at);
    if (!Number.isFinite(t)) continue;
    const cur = byCard.get(e.card_id) ?? { total: 0, recent: false };
    cur.total += 1;
    if (t >= cutoff30) cur.recent = true;
    byCard.set(e.card_id, cur);
  }
  let n = 0;
  for (const c of byCard.values()) if (c.total >= 2 && c.recent) n += 1;
  return n;
}

// Cards created since the 1st of the current SGT month.
export function countNewThisMonth(
  cards: { created_at: string }[],
  nowMs: number,
): number {
  const monthStart = sgtMonthStart(nowMs);
  return cards.filter((c) => Date.parse(c.created_at) >= monthStart).length;
}
