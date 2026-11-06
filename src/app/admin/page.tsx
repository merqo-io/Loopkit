import { AdminPageHeader } from "@/app/admin/admin-page-header";
import { Gift, Stamp } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { platformTotals, recentActivity } from "@/lib/admin-data";
import { formatSgtDateTime } from "@/lib/format";
import { ElevatedCard, EmptyState, StatCard } from "@merqo/ui";

export const revalidate = 0;

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [totals, activity] = await Promise.all([
    platformTotals(),
    recentActivity(15),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-5 py-7">
      <AdminPageHeader title="Overview" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          reverse
          label="Programs"
          value={String(totals.programs)}
          valueClassName="font-mono tracking-tight tabular-nums"
        />
        <StatCard
          reverse
          label="Active programs"
          value={String(totals.active_programs)}
          valueClassName="font-mono tracking-tight tabular-nums"
        />
        <StatCard
          reverse
          label="Customers"
          value={String(totals.customers)}
          valueClassName="font-mono tracking-tight tabular-nums"
        />
        <StatCard
          reverse
          label="Stamps issued"
          value={String(totals.stamps_issued)}
          valueClassName="font-mono tracking-tight tabular-nums"
        />
        <StatCard
          reverse
          label="Rewards redeemed"
          value={String(totals.rewards_redeemed)}
          valueClassName="font-mono tracking-tight tabular-nums"
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Recent activity across all shops
        </h2>
        <ElevatedCard className="p-6">
          <ul className="space-y-2.5">
            {activity.length > 0 ? (
              activity.map((event) => {
                const isRedeem = event.kind === "redeem";
                return (
                  <li
                    key={event.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={
                          isRedeem
                            ? "grid size-7 shrink-0 place-items-center rounded-full bg-gold/20 text-gold-accent"
                            : "grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
                        }
                      >
                        {isRedeem ? (
                          <Gift className="size-3.5" />
                        ) : (
                          <Stamp className="size-3.5" />
                        )}
                      </span>
                      <span className="min-w-0 truncate">
                        <span className="font-medium">
                          {event.program_name ?? "Not set"}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          {event.phone ?? "Not set"}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatSgtDateTime(event.created_at)}
                    </span>
                  </li>
                );
              })
            ) : (
              <li>
                <EmptyState title="No activity yet." className="py-6">
                  Stamps and redemptions across all shops will show here.
                </EmptyState>
              </li>
            )}
          </ul>
        </ElevatedCard>
      </section>
    </main>
  );
}
