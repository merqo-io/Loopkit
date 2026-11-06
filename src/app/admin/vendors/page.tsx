import { requireAdmin } from "@/lib/admin";
import { listVendors } from "@/lib/admin-data";
import { ElevatedCard, PageHeader, EmptyState } from "@merqo/ui";
import { VendorsTable } from "@/app/admin/vendors/vendors-table";

export const revalidate = 0;

export const metadata = { title: "Vendors" };

export default async function AdminVendorsPage() {
  await requireAdmin();

  const vendors = await listVendors();

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-5 py-7">
      <PageHeader
        responsive
        eyebrow="Internal"
        title="Vendors"
        className="mb-0"
      >
        Plans are managed in the Merqo admin; the tier shown is the last one
        Merqo pushed.
      </PageHeader>

      {vendors.length === 0 ? (
        <EmptyState title="No vendors yet.">
          Vendors appear here once they sign up.
        </EmptyState>
      ) : (
        <ElevatedCard className="overflow-x-auto">
          <VendorsTable rows={vendors} />
        </ElevatedCard>
      )}
    </main>
  );
}
