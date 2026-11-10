import { redirect } from "next/navigation";
import { checkLegalAcceptance as sharedCheckLegalAcceptance } from "@merqo/ui/auth";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Is this vendor's terms + privacy acceptance current with the versions
 * @merqo/ui's LEGAL_VERSIONS requires? The shared check asks merqo over HTTP and
 * caches the answer in this kit's loopkit.legal_check_state; this wrapper binds
 * the service client and the merqo env. Fails closed.
 */
export function checkLegalAcceptance(email: string): Promise<boolean> {
  return sharedCheckLegalAcceptance(email, {
    createClient: createServiceClient as never,
    customerSecret: process.env.MERQO_CUSTOMER_SECRET,
    merqoBaseUrl: process.env.MERQO_BASE_URL,
  });
}

/**
 * Page/layout guard companion to the auth-gate helper: bounce a signed-in
 * vendor with a stale or missing legal acceptance to the /legal/accept
 * interstitial. Called at the same point unauthenticated users are sent to
 * /login. A no-op when `email` is falsy (the caller has already handled the
 * no-session case) so it never runs after that redirect has fired.
 */
export async function requireCurrentLegalAcceptance(
  email: string | undefined | null,
): Promise<void> {
  if (email && !(await checkLegalAcceptance(email))) {
    redirect("/legal/accept");
  }
}
