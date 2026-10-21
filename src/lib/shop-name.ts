import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getOrCreateVendorProfile } from "@/lib/merqo-vendor-profile";

// Call only with a vendor id already proven to exist: the merqo RPC creates a missing profile.
export async function getShopName(vendorId: string): Promise<string | null> {
  try {
    const supabase = await createServiceClient();
    const profile = await getOrCreateVendorProfile(supabase, vendorId, null);
    return profile.stall_name.trim() || null;
  } catch {
    return null;
  }
}
