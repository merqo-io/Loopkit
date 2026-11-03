import { Sparkles } from "lucide-react";
import { PlanComparisonTable, ElevatedCard } from "@merqo/ui";
import { requireVendor } from "@/features/auth";
import { isPro, listPrograms, currentProgram } from "@/lib/program";
import { getProgramStats } from "@/lib/stats";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { label: "Loyalty programs", free: "1", pro: "∞" },
  { label: "Loyalty card templates", free: true, pro: true },
  { label: "Change card type", free: true, pro: true },
  { label: "Stats dashboard", free: true, pro: true },
] as const;

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  await requireVendor();
  const [pro, programs] = await Promise.all([isPro(), listPrograms()]);
  const { p } = await searchParams;
  const program = currentProgram(programs, p);
  const stats = program ? await getProgramStats(program.id) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Billing
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Plan
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5">
          {pro && <Sparkles className="size-3.5 text-primary" />}
          <Badge variant={pro ? "gold" : "secondary"}>
            {pro ? "Pro" : "Free"}
          </Badge>
        </span>
      </div>

      {stats && stats.enrolled > 0 && program && (
        <ElevatedCard className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            How your program is doing
          </p>
          <p className="mt-1.5 text-sm">
            <strong className="font-semibold">
              {Math.round(stats.repeatVisitRate * 100)}%
            </strong>{" "}
            of your customers have come back for a second visit, and you&apos;ve
            handed out{" "}
            <strong className="font-semibold">{stats.rewardsTotal}</strong>{" "}
            reward
            {stats.rewardsTotal === 1 ? "" : "s"} so far with {program.name}.
          </p>
        </ElevatedCard>
      )}

      <ElevatedCard
        as="section"
        className="px-5 py-4 text-sm text-muted-foreground"
      >
        {pro
          ? "You're on Pro, unlimited loyalty programs are unlocked. "
          : "You're on Free, with one active loyalty program. "}
        Change plan from your Merqo account.
      </ElevatedCard>

      <PlanComparisonTable
        tiers={[
          { key: "free", label: "Free" },
          { key: "pro", label: "Pro" },
        ]}
        rows={FEATURES.map((f) => ({
          label: f.label,
          values: { free: f.free, pro: f.pro },
        }))}
      />
    </div>
  );
}
