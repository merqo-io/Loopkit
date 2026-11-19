"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  DashboardNav as SharedDashboardNav,
  getSwitchKits,
  TierChip,
} from "@merqo/ui";
import { LayoutList } from "lucide-react";
import { Wordmark } from "@/components/landing/wordmark";
import {
  ACCOUNT_MENU_HELP,
  submitAccountFeedback,
} from "@/lib/account-menu-config";

type Tier = "free" | "pro";

const LINKS = [
  { href: "/dashboard/counter", label: "Counter" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/activity", label: "Activity" },
  { href: "/dashboard/stats", label: "Stats" },
];

function isActive(path: string, href: string): boolean {
  return path === href || path.startsWith(`${href}/`);
}

/** Stable anchor id for the onboarding tour, e.g. "/dashboard/customers" → "nav-customers". */
function tourAnchor(href: string): string {
  return `nav-${href.split("/").pop()}`;
}

/**
 * Dashboard sticky-header row: composes @merqo/ui's DashboardNav (burger +
 * inline links) and AccountMenu (avatar dropdown, owning its own
 * Feedback/Get-help Sheet chrome internally). Keeps the same call-site
 * signature the old hand-rolled version had.
 */
export function DashboardNav({
  signOut,
  email,
  vendorName,
  avatarUrl,
  tier,
}: {
  signOut: () => Promise<void>;
  email: string;
  vendorName: string | null;
  avatarUrl: string | null;
  tier: Tier;
}) {
  const path = usePathname();
  const label = vendorName?.trim() || email.trim().split("@")[0];

  return (
    <SharedDashboardNav
      LinkComponent={Link}
      wordmark={
        <a
          href="/dashboard"
          aria-label="loopkit dashboard home"
          className="shrink-0 rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Wordmark className="text-3xl" />
        </a>
      }
      navLinks={LINKS}
      isActiveHref={(href) => isActive(path, href)}
      tourAnchor={tourAnchor}
      vendor={{
        name: label,
        avatarUrl: avatarUrl ?? undefined,
        tier,
        subtitle: vendorName?.trim() || "Your stall",
      }}
      signOutAction={signOut}
      extraLink={{ href: "/setup", label: "Programs", icon: LayoutList }}
      showPlanItem
      tierBadge={<TierChip tier={tier} />}
      switchKits={getSwitchKits("loopkit")}
      getHelp={ACCOUNT_MENU_HELP}
      onFeedbackSubmit={submitAccountFeedback}
      showNps
    />
  );
}
