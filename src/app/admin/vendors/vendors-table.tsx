"use client";

import { DataTable, tierLabel, type DataTableColumn } from "@merqo/ui";
import type { VendorRow } from "@/lib/admin-data";
import { Badge } from "@merqo/ui/primitives";

const columns: DataTableColumn<VendorRow>[] = [
  {
    header: "Vendor",
    cell: (v) => <span className="font-medium">{v.email ?? "Not set"}</span>,
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
        <Badge className="bg-gold text-gold-foreground">
          {tierLabel("pro")}
        </Badge>
      ) : (
        <Badge variant="outline">{tierLabel("free")}</Badge>
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
