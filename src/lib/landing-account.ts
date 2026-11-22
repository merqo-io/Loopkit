import type { SupabaseClient } from "@supabase/supabase-js";
import { toNavUser, type NavUser } from "@merqo/ui";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

type StallNameRow = { stall_name: string | null };

/**
 * The signed-in viewer for public pages, or null. The label is the shared
 * merqo.vendor_profile stall name, the same source the dashboard shows
 * (`getVendorProfile`). That table has RLS with no authenticated policy, so
 * it is read with the service client, scoped to the verified viewer's own id.
 * The read is a plain select: the get_or_create RPC would insert a profile row
 * as a side effect of viewing a public page. `getVendorProfile` itself is
 * avoided because `requireVendor` would redirect a signed-in visitor who still
 * has to accept the legal terms away from a public page. A failed read falls
 * back to the name derived from the auth user.
 */
export async function getLandingAccount(): Promise<NavUser | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  try {
    const service = (await createServiceClient()) as unknown as SupabaseClient;
    const { data, error } = await service
      .schema("merqo")
      .from("vendor_profile")
      .select("stall_name")
      .eq("vendor_id", user.id)
      .maybeSingle<StallNameRow>();
    if (error) return toNavUser(user);
    return toNavUser(user, data?.stall_name);
  } catch {
    return toNavUser(user);
  }
}
