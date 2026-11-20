"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminShell } from "@merqo/ui";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/programs", label: "Programs" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/activity", label: "Activity" },
];

/**
 * Client wrapper that feeds `usePathname()` to the shared AdminShell. The
 * layout stays a Server Component so its `requireAdmin()` gate and sign-out
 * server action are untouched; both reach this frame as plain props.
 */
export function AdminFrame({
  wordmark,
  actions,
  children,
}: {
  wordmark: React.ReactNode;
  actions: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <AdminShell
      wordmark={wordmark}
      tabs={TABS}
      pathname={pathname}
      actions={actions}
      LinkComponent={Link}
    >
      {children}
    </AdminShell>
  );
}
