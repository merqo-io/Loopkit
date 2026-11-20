import { toNavUser, type NavUser } from "@merqo/ui";
import { createServerClient } from "@/lib/supabase/server";

/**
 * The signed-in viewer for public pages, or null. Reads the stall name
 * straight from `vendors` instead of `getVendorProfile`, because that goes
 * through `requireVendor` and would redirect a signed-in visitor who still has
 * to accept the legal terms away from a public page.
 */
export async function getLandingAccount(): Promise<NavUser | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("vendors")
    .select("name")
    .eq("vendor_id", user.id)
    .maybeSingle();
  return toNavUser(user, data?.name);
}
