import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getOrCreateVendorProfile } from "@/lib/merqo-vendor-profile";
import { marketingConsentText } from "@/lib/marketing-consent";

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

/**
 * Rebuilds the exact wording the customer was shown. Returns null when the
 * shown shop name is no longer the vendor's name, so nothing is stored.
 */
export async function shownConsentWording(
  vendorId: string,
  shownShop: string,
): Promise<string | null> {
  if (!shownShop) return marketingConsentText(null);
  return (await getShopName(vendorId)) === shownShop
    ? marketingConsentText(shownShop)
    : null;
}
