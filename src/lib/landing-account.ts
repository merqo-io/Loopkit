import { toNavUser, type NavUser } from "@merqo/ui";
import { getOrCreateVendorProfile } from "@/lib/merqo-vendor-profile";
import { createServerClient } from "@/lib/supabase/server";

/**
 * The signed-in viewer for public pages, or null. The label is the shared
 * merqo.vendor_profile stall name, the same source the dashboard shows;
 * `vendors.name` is only the seed and the fallback. It does not call
 * `getVendorProfile`, because that goes through `requireVendor` and would
 * redirect a signed-in visitor who still has to accept the legal terms away
 * from a public page. merqo.vendor_profile has no client-readable policy, so
 * the get_or_create RPC (a pure read once the row exists) is the only path.
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
  const localName = data?.name ?? null;
  try {
    const profile = await getOrCreateVendorProfile(
      supabase,
      user.id,
      localName,
    );
    return toNavUser(user, profile.stall_name);
  } catch {
    return toNavUser(user, localName);
  }
}
