"use client";

import { DataTable, type DataTableColumn } from "@merqo/ui";
import type { VendorRow } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";

const columns: DataTableColumn<VendorRow>[] = [
  {
    header: "Vendor",
    cell: (v) => <span className="font-medium">{v.email ?? "—"}</span>,
  },
  {
    header: "Programs",
    cell: (v) => <span className="tabular-nums">{v.program_count}</span>,
    className: "text-right",
  },
  {
    header: "Tier",
    cell: (v) =>
      v.is_pro ? (
        <Badge variant="gold">Pro</Badge>
      ) : (
        <Badge variant="outline">Free</Badge>
      ),
  },
];

// `DataTable` is a `@merqo/ui` Client Component, so its `columns` cell
// renderers and `getRowKey` function can't be handed to it from the Server
// Component page. This client boundary owns them; the page passes only the
// serializable `rows` array.
export function VendorsTable({ rows }: { rows: VendorRow[] }) {
  return (
    <DataTable rows={rows} columns={columns} getRowKey={(v) => v.vendor_id} />
  );
}
