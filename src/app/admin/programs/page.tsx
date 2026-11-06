import { AdminPageHeader } from "@/app/admin/admin-page-header";
import { ElevatedCard } from "@merqo/ui";
import { EmptyState } from "@/components/empty-state";
import { requireAdmin } from "@/lib/admin";
import { listProgramsOverview } from "@/lib/admin-data";
import { ProgramsTable } from "@/app/admin/programs/programs-table";

export const revalidate = 0;

export default async function AdminProgramsPage() {
  await requireAdmin();

  const programs = await listProgramsOverview();
  // eslint-disable-next-line react-hooks/purity -- the wall clock is read once per request on purpose
  const now = Date.now();

  // Most-recently-active shops first; never-active ones fall to the bottom.
  const rows = [...programs].sort((a, b) =>
    (b.last_activity_at ?? "").localeCompare(a.last_activity_at ?? ""),
  );

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-5 py-7">
      <AdminPageHeader title="Programs" />

      {rows.length === 0 ? (
        <EmptyState title="No programs yet.">
          Programs appear here once a vendor creates one.
        </EmptyState>
      ) : (
        <ElevatedCard className="overflow-x-auto">
          <ProgramsTable rows={rows} now={now} />
        </ElevatedCard>
      )}
    </main>
  );
}
