import Link from "next/link";
import { redirect } from "next/navigation";
import { StatTile, ElevatedCard } from "@merqo/ui";
import { requireVendor } from "@/features/auth";
import { listPrograms, currentProgram } from "@/lib/program";
import {
  getProgramStats,
  getVendorStats,
  getVendorMechanicBreakdown,
  countExpiredVouchers,
  type ProgramStats,
} from "@/lib/stats";
import { ProgramSwitcher } from "@/app/dashboard/program-switcher";
import { VisitsChart } from "@/app/dashboard/stats/visits-chart";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

/** Wraps @merqo/ui's shared StatTile (value-above-label) in loopkit's own card shell. */
function Tile({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number | null;
}) {
  return (
    <ElevatedCard className="p-5">
      <StatTile
        label={label}
        value={value}
        valueClassName="font-mono tracking-tight tabular-nums"
        reverse
        delta={delta}
        deltaSize="xs"
        deltaTooltip="vs. the prior 30 days"
      />
    </ElevatedCard>
  );
}

function TileGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{children}</div>
    </section>
  );
}

const pct = (rate: number) => `${Math.round(rate * 100)}%`;

// Three groups of three instead of one dense row, so each block answers one
// question: who is here, are they visiting, and are rewards being used.
function StatsTiles({
  stats,
  expiredUnclaimed,
}: {
  stats: ProgramStats;
  expiredUnclaimed: number;
}) {
  return (
    <>
      <TileGroup title="Customers">
        <Tile label="Total customers" value={String(stats.enrolled)} />
        <Tile
          label="Active in the last 30 days"
          value={String(stats.active)}
          delta={stats.activeDelta}
        />
        <Tile label="Not seen in 30 days" value={String(stats.lapsed)} />
      </TileGroup>
      <TileGroup title="Visits">
        <Tile
          label="Visits in the last 30 days"
          value={String(stats.visits30d)}
          delta={stats.visitsDelta}
        />
        <Tile label="Came back" value={pct(stats.repeatVisitRate)} />
        <Tile
          label="Days between visits"
          value={
            stats.avgDaysBetweenVisits === null
              ? "None yet"
              : `${stats.avgDaysBetweenVisits.toFixed(1)}d`
          }
        />
      </TileGroup>
      <TileGroup title="Rewards">
        <Tile
          label="Rewards redeemed in the last 30 days"
          value={String(stats.rewards30d)}
          delta={stats.rewardsDelta}
        />
        <Tile label="Rewards claimed" value={pct(stats.redemptionRate)} />
        <Tile
          label="Rewards expired unclaimed"
          value={String(expiredUnclaimed)}
        />
      </TileGroup>
    </>
  );
}

function NoCustomers({ programId }: { programId?: string }) {
  return (
    <EmptyState
      title="No customers yet."
      actions={
        <Link
          href={
            programId
              ? `/dashboard/counter?p=${programId}`
              : "/dashboard/counter"
          }
          className="rounded-lg border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          Open the Counter
        </Link>
      }
    >
      Share your QR from the Counter to start enrolling.
    </EmptyState>
  );
}

type StatsPageProps = {
  searchParams: Promise<{ p?: string }>;
};

export default async function StatsPage({ searchParams }: StatsPageProps) {
  await requireVendor();

  const programs = await listPrograms();
  const { p } = await searchParams;

  if (!p && programs.length === 1) {
    redirect(`/dashboard/stats?p=${programs[0].id}`);
  }

  if (!p) {
    const programIds = programs.map((prog) => prog.id);
    const [stats, expiredUnclaimed, mechanicBreakdown] = await Promise.all([
      getVendorStats(programIds),
      countExpiredVouchers(programIds),
      getVendorMechanicBreakdown(programIds),
    ]);

    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Performance" title="Stats" className="mb-0">
          How your shop is performing across every program.
        </PageHeader>

        <ProgramSwitcher
          programs={programs}
          currentId=""
          basePath="/dashboard/stats"
        />

        {stats.enrolled === 0 ? (
          <NoCustomers />
        ) : (
          <>
            <StatsTiles stats={stats} expiredUnclaimed={expiredUnclaimed} />

            <ElevatedCard className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Last 30 days
              </h2>
              <div className="mt-4">
                <VisitsChart data={stats.visitsByDay} />
              </div>
            </ElevatedCard>

            {mechanicBreakdown.length > 1 && (
              <ElevatedCard className="p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  By mechanic
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {mechanicBreakdown.map((m) => (
                    <div key={m.mechanic} className="rounded-lg border p-3">
                      <p className="text-sm font-semibold">{m.mechanic}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-mono tabular-nums">
                          {m.enrolled}
                        </span>{" "}
                        enrolled ·{" "}
                        <span className="font-mono tabular-nums">
                          {m.visitsTotal}
                        </span>{" "}
                        visits ·{" "}
                        <span className="font-mono tabular-nums">
                          {Math.round(m.redemptionRate * 100)}%
                        </span>{" "}
                        redeemed
                      </p>
                    </div>
                  ))}
                </div>
              </ElevatedCard>
            )}
          </>
        )}
      </div>
    );
  }

  const program = currentProgram(programs, p);
  if (!program) redirect("/setup");

  const [stats, expiredUnclaimed] = await Promise.all([
    getProgramStats(program.id),
    countExpiredVouchers([program.id]),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Performance" title="Stats" className="mb-0">
        How {program.name} is performing.
      </PageHeader>

      <ProgramSwitcher
        programs={programs}
        currentId={program.id}
        basePath="/dashboard/stats"
      />

      {stats.enrolled === 0 ? (
        <NoCustomers programId={program.id} />
      ) : (
        <>
          <StatsTiles stats={stats} expiredUnclaimed={expiredUnclaimed} />

          <ElevatedCard className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Last 30 days
            </h2>
            <div className="mt-4">
              <VisitsChart data={stats.visitsByDay} />
            </div>
          </ElevatedCard>
        </>
      )}
    </div>
  );
}
