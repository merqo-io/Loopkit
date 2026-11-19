"use client";

import Link from "next/link";
import { AccountMenu } from "@merqo/ui";
import {
  ACCOUNT_MENU_HELP,
  submitAccountFeedback,
} from "@/lib/account-menu-config";

/**
 * Avatar menu for the landing nav. A client wrapper because the help and
 * feedback handlers are functions, which a Server Component can't pass down.
 * Tier is left out: reading it needs the vendor-only entitlement guard.
 */
export function NavAccount({
  signOut,
  email,
  name,
  avatarUrl,
}: {
  signOut: () => Promise<void>;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}) {
  const label = name?.trim() || email.trim().split("@")[0];
  return (
    <AccountMenu
      LinkComponent={Link}
      vendor={{
        name: label,
        avatarUrl: avatarUrl ?? undefined,
        subtitle: name?.trim() || email,
      }}
      signOutAction={signOut}
      getHelp={ACCOUNT_MENU_HELP}
      onFeedbackSubmit={submitAccountFeedback}
      showNps
    />
  );
}
