import { createServerClient } from "@/lib/supabase/server";

export type LandingAccount = {
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

/**
 * The signed-in viewer for public pages, or null. Reads the stall name
 * straight from `vendors` instead of `getVendorProfile`, because that goes
 * through `requireVendor` and would redirect a signed-in visitor who still has
 * to accept the legal terms away from a public page.
 */
export async function getLandingAccount(): Promise<LandingAccount | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("vendors").select("name").maybeSingle();
  return {
    email: user.email ?? "",
    name: data?.name ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };
}
