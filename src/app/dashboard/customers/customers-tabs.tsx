import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard/customers", label: "Customers", key: "customers" },
  {
    href: "/dashboard/customers/referrals",
    label: "Referrals",
    key: "referrals",
  },
] as const;

/** Sub-navigation shared by the Customers list and its Referrals tab. */
export function CustomersTabs({
  current,
}: {
  current: "customers" | "referrals";
}) {
  return (
    <nav aria-label="Customers sections" className="flex gap-1 border-b">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={current === tab.key ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium",
            current === tab.key
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
