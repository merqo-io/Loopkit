import { MS_PER_DAY } from "@/lib/time";
import type {
  MechanicStats,
  ProgramStats,
  StatsCard,
  StatsEvent,
} from "./stats-types";
import { pctChange } from "./stats-metrics";

// Pure card-level aggregation. `activityEvents`/`rewardEvents` are the
// already-classified arrays from `classifyActivity` — this function does no
// kind filtering itself.
export function computeCardStats(
  cards: StatsCard[],
  activityEvents: StatsEvent[],
  rewardEvents: StatsEvent[],
  nowMs: number,
): Omit<ProgramStats, "visitsByDay"> {
  const enrolled = cards.length;
  const cutoff7d = nowMs - 7 * MS_PER_DAY;
  const cutoff30d = nowMs - 30 * MS_PER_DAY;
  const cutoff60d = nowMs - 60 * MS_PER_DAY;

  const newThisWeek = cards.filter(
    (c) => Date.parse(c.created_at) >= cutoff7d,
  ).length;

  const visitsTotal = activityEvents.length;
  const visits30d = activityEvents.filter(
    (e) => Date.parse(e.created_at) >= cutoff30d,
  ).length;

  const rewardsTotal = rewardEvents.length;
  const rewards30d = rewardEvents.filter(
    (e) => Date.parse(e.created_at) >= cutoff30d,
  ).length;

  const activityCountByCard = new Map<string, number>();
  const activeCardIds = new Set<string>();
  for (const e of activityEvents) {
    activityCountByCard.set(
      e.card_id,
      (activityCountByCard.get(e.card_id) ?? 0) + 1,
    );
    if (Date.parse(e.created_at) >= cutoff30d) activeCardIds.add(e.card_id);
  }
  const repeatCards = [...activityCountByCard.values()].filter(
    (n) => n >= 2,
  ).length;

  const priorVisits30d = activityEvents.filter((e) => {
    const t = Date.parse(e.created_at);
    return t >= cutoff60d && t < cutoff30d;
  }).length;

  const priorRewards30d = rewardEvents.filter((e) => {
    const t = Date.parse(e.created_at);
    return t >= cutoff60d && t < cutoff30d;
  }).length;

  const priorActiveCardIds = new Set<string>();
  for (const e of activityEvents) {
    const t = Date.parse(e.created_at);
    if (t >= cutoff60d && t < cutoff30d) priorActiveCardIds.add(e.card_id);
  }

  return {
    enrolled,
    newThisWeek,
    visitsTotal,
    visits30d,
    rewardsTotal,
    rewards30d,
    redemptionRate: enrolled === 0 ? 0 : rewardsTotal / enrolled,
    repeatVisitRate: enrolled === 0 ? 0 : repeatCards / enrolled,
    active: activeCardIds.size,
    lapsed: enrolled - activeCardIds.size,
    avgVisitsPerCustomer: enrolled === 0 ? 0 : visitsTotal / enrolled,
    visitsDelta: pctChange(visits30d, priorVisits30d),
    rewardsDelta: pctChange(rewards30d, priorRewards30d),
    activeDelta: pctChange(activeCardIds.size, priorActiveCardIds.size),
    avgDaysBetweenVisits: null,
  };
}

// Which named mechanic (per docs/business's Stamp/Growth/Chance-Card framing)
// a program's engine `type` belongs to. "Points" is a stamp.ts render variant
// (points_per_visit config), not a distinct DB-level type — grouping it apart
// from Stamp would mean guessing at a config heuristic, so it stays under
// Stamp here.
export function mechanicLabel(type: string): string {
  if (type === "plant") return "Growth";
  if (type === "lucky" || type === "wheel" || type === "scratch") {
    return "Chance Card";
  }
  return "Stamp";
}

// Pure aggregation, same shape as computeCardStats but bucketed by mechanic
// instead of pooled across every program.
export function computeMechanicBreakdown(
  programs: { id: string; type: string }[],
  cards: { id: string; program_id: string }[],
  activityEvents: StatsEvent[],
  rewardEvents: StatsEvent[],
): MechanicStats[] {
  const programType = new Map(programs.map((p) => [p.id, p.type]));
  const cardMechanic = new Map(
    cards.map((c) => [
      c.id,
      mechanicLabel(programType.get(c.program_id) ?? "stamp"),
    ]),
  );

  const byMechanic = new Map<
    string,
    { enrolled: number; visitsTotal: number; rewardsTotal: number }
  >();
  const bucket = (mechanic: string) => {
    let b = byMechanic.get(mechanic);
    if (!b) {
      b = { enrolled: 0, visitsTotal: 0, rewardsTotal: 0 };
      byMechanic.set(mechanic, b);
    }
    return b;
  };

  for (const c of cards) bucket(cardMechanic.get(c.id) ?? "Stamp").enrolled++;
  for (const e of activityEvents) {
    bucket(cardMechanic.get(e.card_id) ?? "Stamp").visitsTotal++;
  }
  for (const e of rewardEvents) {
    bucket(cardMechanic.get(e.card_id) ?? "Stamp").rewardsTotal++;
  }

  return [...byMechanic.entries()]
    .map(([mechanic, b]) => ({
      mechanic,
      ...b,
      redemptionRate: b.enrolled === 0 ? 0 : b.rewardsTotal / b.enrolled,
    }))
    .sort((a, b) => b.visitsTotal - a.visitsTotal);
}
