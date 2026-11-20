"use client";

import Link from "next/link";
import { LandingAccountNav, type NavUser } from "@merqo/ui";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { submitSupportMessageAction } from "@/app/actions/support";
import { SUPPORT_CATEGORY_LABELS } from "@/lib/schemas";

/**
 * Client wrapper because the support and feedback adapters are plain
 * functions, which a Server Component can't pass to a client component. Errors
 * reach the root layout's sonner Toaster through the shared default `onError`.
 */
export function NavAccount({
  user,
  signOut,
}: {
  user: NavUser;
  signOut: () => Promise<void>;
}) {
  return (
    <LandingAccountNav
      kit="loopkit"
      dashboardHref="/dashboard"
      user={user}
      signOutAction={signOut}
      LinkComponent={Link}
      supportCategories={SUPPORT_CATEGORY_LABELS}
      actions={{
        submitSupport: ({ category, message }) =>
          submitSupportMessageAction({ category, body: message }),
        submitFeedback: ({ nps, message }) =>
          submitFeedbackAction({ nps, message }),
      }}
    />
  );
}
