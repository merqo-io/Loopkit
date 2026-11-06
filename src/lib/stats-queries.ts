import { readAllRows, readRowsForIds } from "@/lib/read-all-rows";
import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { MS_PER_DAY } from "@/lib/time";
import type {
  MechanicStats,
  OverviewCard,
  ProgramStats,
  StatsEvent,
} from "./stats-types";
import {
  avgDaysBetweenVisits,
  bucketVisitsByDay,
  classifyActivity,
} from "./stats-metrics";
import { computeCardStats, computeMechanicBreakdown } from "./stats-compute";

// Impure shell for the dashboard Overview's raw reads. Issues its own
// cards + stamp_events query (an independent query, not shared with
// getVendorStats, whose public shape stays unchanged) and returns the
// classified event arrays plus the per-card fields the Overview helpers need
// (program_id, stamp_count, created_at). RLS scopes both reads to the
// signed-in vendor, same as getVendorStats.
export async function getVendorOverviewInputs(programIds: string[]): Promise<{
  activityEvents: StatsEvent[];
  rewardEvents: StatsEvent[];
  cards: OverviewCard[];
}> {
  if (programIds.length === 0) {
    return { activityEvents: [], rewardEvents: [], cards: [] };
  }
  const supabase = await createServerClient();

  const { data: cards, error: cardsError } = await readRowsForIds(
    programIds,
    (batch, start, end) =>
      supabase
        .from("cards")
        .select("id,program_id,stamp_count,created_at")
        .in("program_id", batch)
        .order("id", { ascending: true })
        .range(start, end),
  );
  if (cardsError) {
    throw new Error(`getVendorOverviewInputs: ${cardsError.message}`);
  }

  const cardIds = (cards ?? []).map((c) => c.id);
  let events: StatsEvent[] = [];
  if (cardIds.length > 0) {
    const { data, error } = await readRowsForIds(cardIds, (batch, start, end) =>
      supabase
        .from("stamp_events")
        .select("card_id,kind,payload,created_at")
        .in("card_id", batch)
        .order("id", { ascending: true })
        .range(start, end),
    );
    if (error) throw new Error(`getVendorOverviewInputs: ${error.message}`);
    events = data ?? [];
  }

  const { activityEvents, rewardEvents } = classifyActivity(events);
  return { activityEvents, rewardEvents, cards: cards ?? [] };
}

// Impure shell: fetch every one of the vendor's programs' cards + events,
// then delegate to computeMechanicBreakdown. Only meaningful vendor-wide —
// a single program is already one mechanic.
export async function getVendorMechanicBreakdown(
  programIds: string[],
): Promise<MechanicStats[]> {
  if (programIds.length === 0) return [];
  const supabase = await createServerClient();

  const { data: programs, error: programsError } = await readRowsForIds(
    programIds,
    (batch, start, end) =>
      supabase
        .from("programs")
        .select("id,type")
        .in("id", batch)
        .order("id", { ascending: true })
        .range(start, end),
  );
  if (programsError) {
    throw new Error(`getVendorMechanicBreakdown: ${programsError.message}`);
  }

  const { data: cards, error: cardsError } = await readRowsForIds(
    programIds,
    (batch, start, end) =>
      supabase
        .from("cards")
        .select("id,program_id")
        .in("program_id", batch)
        .order("id", { ascending: true })
        .range(start, end),
  );
  if (cardsError) {
    throw new Error(`getVendorMechanicBreakdown: ${cardsError.message}`);
  }

  const cardIds = (cards ?? []).map((c) => c.id);
  let events: StatsEvent[] = [];
  if (cardIds.length > 0) {
    const { data, error } = await readRowsForIds(cardIds, (batch, start, end) =>
      supabase
        .from("stamp_events")
        .select("card_id,kind,payload,created_at")
        .in("card_id", batch)
        .order("id", { ascending: true })
        .range(start, end),
    );
    if (error) {
      throw new Error(`getVendorMechanicBreakdown: ${error.message}`);
    }
    events = data ?? [];
  }

  const { activityEvents, rewardEvents } = classifyActivity(events);
  return computeMechanicBreakdown(
    programs ?? [],
    cards ?? [],
    activityEvents,
    rewardEvents,
  );
}

// Impure shell: fetch this program's cards + stamp_events (RLS scopes both
// to the signed-in vendor, same as activity/page.tsx), then delegate to the
// pure helpers above.
export const getProgramStats = cache(async function getProgramStats(
  programId: string,
): Promise<ProgramStats> {
  const supabase = await createServerClient();
  const nowMs = Date.now();

  const { data: cards, error: cardsError } = await readAllRows((start, end) =>
    supabase
      .from("cards")
      .select("id,created_at")
      .eq("program_id", programId)
      .order("id", { ascending: true })
      .range(start, end),
  );
  if (cardsError) throw new Error(`getProgramStats: ${cardsError.message}`);

  const cardIds = (cards ?? []).map((c) => c.id);

  let events: StatsEvent[] = [];
  if (cardIds.length > 0) {
    const { data, error } = await readRowsForIds(cardIds, (batch, start, end) =>
      supabase
        .from("stamp_events")
        .select("card_id,kind,payload,created_at")
        .in("card_id", batch)
        .order("id", { ascending: true })
        .range(start, end),
    );
    if (error) throw new Error(`getProgramStats: ${error.message}`);
    events = data ?? [];
  }

  const { activityEvents, rewardEvents } = classifyActivity(events);
  const cardStats = computeCardStats(
    cards ?? [],
    activityEvents,
    rewardEvents,
    nowMs,
  );
  const visitsByDay = bucketVisitsByDay(activityEvents, nowMs);

  return {
    ...cardStats,
    visitsByDay,
    avgDaysBetweenVisits: avgDaysBetweenVisits(activityEvents),
  };
});

// Impure shell: count of `reward_vouchers` that flipped to `expired` in the
// last 30 days, across the given programs. Separately sourced from (and
// added alongside, not replacing) rewards30d/redemptionRate above — those
// stay on their existing stamp_events/chance-win source per
// docs/superpowers/specs/2026-07-16-reward-voucher-ledger-design.md's
// explicit decision not to risk a regression migrating them onto the newer
// reward_vouchers ledger.
export async function countExpiredVouchers(
  programIds: string[],
): Promise<number> {
  if (programIds.length === 0) return 0;
  const supabase = await createServerClient();
  const cutoff = new Date(Date.now() - 30 * MS_PER_DAY).toISOString();
  const { count, error } = await supabase
    .from("reward_vouchers")
    .select("id", { count: "exact", head: true })
    .in("program_id", programIds)
    .eq("status", "expired")
    .gte("updated_at", cutoff);
  if (error) throw new Error(`countExpiredVouchers: ${error.message}`);
  return count ?? 0;
}

// Impure shell: fetch cards+events across every one of the vendor's
// programs (not just one), then delegate to the same pure pipeline
// getProgramStats uses. classifyActivity/computeCardStats/
// bucketVisitsByDay/avgDaysBetweenVisits are already program-agnostic —
// no new pure logic is needed, only a wider query.
export async function getVendorStats(
  programIds: string[],
): Promise<ProgramStats> {
  const supabase = await createServerClient();
  const nowMs = Date.now();

  if (programIds.length === 0) {
    const cardStats = computeCardStats([], [], [], nowMs);
    return {
      ...cardStats,
      visitsByDay: bucketVisitsByDay([], nowMs),
      avgDaysBetweenVisits: null,
    };
  }

  const { data: cards, error: cardsError } = await readRowsForIds(
    programIds,
    (batch, start, end) =>
      supabase
        .from("cards")
        .select("id,created_at")
        .in("program_id", batch)
        .order("id", { ascending: true })
        .range(start, end),
  );
  if (cardsError) throw new Error(`getVendorStats: ${cardsError.message}`);

  const cardIds = (cards ?? []).map((c) => c.id);

  let events: StatsEvent[] = [];
  if (cardIds.length > 0) {
    const { data, error } = await readRowsForIds(cardIds, (batch, start, end) =>
      supabase
        .from("stamp_events")
        .select("card_id,kind,payload,created_at")
        .in("card_id", batch)
        .order("id", { ascending: true })
        .range(start, end),
    );
    if (error) throw new Error(`getVendorStats: ${error.message}`);
    events = data ?? [];
  }

  const { activityEvents, rewardEvents } = classifyActivity(events);
  const cardStats = computeCardStats(
    cards ?? [],
    activityEvents,
    rewardEvents,
    nowMs,
  );
  const visitsByDay = bucketVisitsByDay(activityEvents, nowMs);

  return {
    ...cardStats,
    visitsByDay,
    avgDaysBetweenVisits: avgDaysBetweenVisits(activityEvents),
  };
}
