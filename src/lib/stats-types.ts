export type ProgramStats = {
  enrolled: number;
  newThisWeek: number;
  visitsTotal: number;
  visits30d: number;
  visitsByDay: { date: string; count: number }[];
  rewardsTotal: number;
  rewards30d: number;
  redemptionRate: number;
  repeatVisitRate: number;
  active: number;
  lapsed: number;
  avgVisitsPerCustomer: number;
  visitsDelta: number | null;
  rewardsDelta: number | null;
  activeDelta: number | null;
  // Average gap between a repeat customer's consecutive visits, pooled
  // across cards, computed over full history (not the 30-day window).
  avgDaysBetweenVisits: number | null;
};

export type StatsEvent = {
  card_id: string;
  kind: string;
  created_at: string;
  payload?: unknown;
};
export type StatsCard = { id: string; created_at: string };

export type OverviewCard = {
  id: string;
  program_id: string;
  stamp_count: number;
  created_at: string;
};

export type MechanicStats = {
  mechanic: string;
  enrolled: number;
  visitsTotal: number;
  rewardsTotal: number;
  redemptionRate: number;
};
