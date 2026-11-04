import { CustomerSearchToolbar } from "./customer-search-toolbar";
import Link from "next/link";
import { ElevatedCard } from "@merqo/ui";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { listCards } from "@/lib/cards";
import { getVendorOverviewInputs } from "@/lib/stats";
import {
  overviewCohortCardIds,
  type OverviewCohort,
} from "@/lib/overview-cohorts";
import type { Program } from "@/lib/program";

const titles: Record<OverviewCohort, string> = {
  "gone-quiet": "Regulars gone quiet",
  "one-away": "One stamp from a reward",
  "two-away": "Two stamps from a reward",
};

export async function OverviewCohortList({
  programs,
  cohort,
  p,
  q,
}: {
  programs: Program[];
  cohort: OverviewCohort;
  p?: string;
  q?: string;
}) {
  const selected = p
    ? programs.filter((program) => program.id === p)
    : programs;
  const inputs = await getVendorOverviewInputs(
    selected.map((program) => program.id),
  );
  const ids = overviewCohortCardIds(
    cohort,
    selected,
    inputs,
    new Date().getTime(),
  );
  const matches = (
    await Promise.all(
      selected.map(async (program) => ({
        program,
        cards:
          ids.size === 0
            ? []
            : (await listCards(program.id, q)).filter((card) =>
                ids.has(card.id),
              ),
      })),
    )
  ).flatMap(({ program, cards }) => cards.map((card) => ({ program, card })));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your regulars"
        title={titles[cohort]}
        className="mb-0"
      >
        {matches.length} matching cards across the selected programs.
      </PageHeader>
      <CustomerSearchToolbar
        programs={programs}
        currentId={p ?? ""}
        query={q}
        cohort={cohort}
      />
      {matches.length === 0 ? (
        <EmptyState
          title="No matching cards yet."
          actions={
            <Link
              href="/dashboard/customers"
              className="rounded-lg border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              See all customers
            </Link>
          }
        >
          Cards show up here as customers reach this point.
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {matches.map(({ program, card }) => (
            <ElevatedCard
              as="li"
              key={card.id}
              className="space-y-2 p-3 text-sm"
            >
              <Link
                className="font-medium hover:underline"
                href={"/dashboard/customers/" + encodeURIComponent(card.phone)}
              >
                {card.phone}
              </Link>
              <p>{program.name}</p>
              <Link
                className="hover:underline"
                href={
                  "/dashboard/counter?p=" +
                  encodeURIComponent(program.id) +
                  "&phone=" +
                  encodeURIComponent(card.phone)
                }
              >
                Serve
              </Link>
            </ElevatedCard>
          ))}
        </ul>
      )}
      <Link href="/dashboard/customers" className="text-sm hover:underline">
        All customers
      </Link>
    </div>
  );
}
