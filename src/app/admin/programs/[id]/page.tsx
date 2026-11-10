import { notFound } from "next/navigation";
import { BackButton, PageHeader, EmptyState, StatCard } from "@merqo/ui";
import { Gift, Stamp } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { getProgramDetail } from "@/lib/admin-data";
import { programHealth } from "@/lib/program-health";
import { ProgramHealthBadge } from "@/app/admin/health-badge";
import { formatSgtDate, formatSgtDateTime } from "@/lib/format";
import { Badge } from "@merqo/ui/primitives";
import { ElevatedCard } from "@merqo/ui";
import { Manage } from "@/app/admin/programs/[id]/manage";

export const revalidate = 0;

export const metadata = { title: "Program" };

export default async function AdminProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const detail = await getProgramDetail(id);
  if (!detail) notFound();

  const { program, vendor_email, cards, events } = detail;
  // eslint-disable-next-line react-hooks/purity -- the wall clock is read once per request on purpose
  const now = Date.now();

  const stampsIssued = events.filter((e) => e.kind === "stamp").length;
  const rewardsRedeemed = cards.reduce((sum, c) => sum + c.reward_count, 0);
  const lastActivityAt = events[0]?.created_at ?? null;
  const health = programHealth(
    {
      customer_count: cards.length,
      last_activity_at: lastActivityAt,
      created_at: program.created_at,
    },
    now,
  );

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-5 py-7">
      <div className="space-y-3">
        <BackButton href="/admin/programs" label="All programs" />
        <PageHeader
          responsive
          eyebrow="Internal"
          title={program.name}
          className="mb-0"
        >
          <div className="flex flex-wrap items-center gap-2">
            <ProgramHealthBadge health={health} />
            <Badge variant={program.active ? "default" : "outline"}>
              {program.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="mt-2">
            Buy {program.stamps_required}, get 1 {program.reward_text}
            {vendor_email && <> · {vendor_email}</>}
          </p>
        </PageHeader>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          reverse
          label="Customers"
          value={String(cards.length)}
          valueClassName="font-mono tracking-tight tabular-nums"
        />
        <StatCard
          reverse
          label="Stamps issued"
          value={String(stampsIssued)}
          valueClassName="font-mono tracking-tight tabular-nums"
        />
        <StatCard
          reverse
          label="Rewards redeemed"
          value={String(rewardsRedeemed)}
          valueClassName="font-mono tracking-tight tabular-nums"
        />
        <StatCard
          reverse
          label="Last activity"
          value={lastActivityAt ? formatSgtDate(lastActivityAt) : "Not set"}
          valueClassName="font-mono tracking-tight tabular-nums"
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Recent activity
        </h2>
        <ElevatedCard className="p-6">
          <ul className="space-y-2.5">
            {events.length > 0 ? (
              events.slice(0, 15).map((event) => {
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
                        <span className="font-medium capitalize">
                          {event.kind}
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
                  Stamps and redemptions will show here.
                </EmptyState>
              </li>
            )}
          </ul>
        </ElevatedCard>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Manage
        </h2>
        <Manage
          program={{
            id: program.id,
            name: program.name,
            active: program.active,
          }}
          cards={cards.map((c) => ({
            id: c.id,
            phone: c.phone,
            stamp_count: c.stamp_count,
            reward_count: c.reward_count,
          }))}
          stampsRequired={program.stamps_required}
        />
      </section>
    </main>
  );
}
