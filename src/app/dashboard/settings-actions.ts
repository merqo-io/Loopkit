"use server";

import { revalidatePath } from "next/cache";
import { requireVendor } from "@/features/auth";
import { isPro } from "@/lib/program";
import { createServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@merqo/ui/kit-api";

export type QkitEarnConfigResult = ActionResult<{
  enabled: boolean;
  programId: string | null;
}>;

// Vendor-owned setting: which stamp program (if any) earns a stamp when a
// customer completes a qkit order. Pro-gated, same tier check as the
// program-count limit (isPro from @/lib/program).
export async function saveQkitEarnConfigAction(
  formData: FormData,
): Promise<QkitEarnConfigResult> {
  const { user } = await requireVendor();
  const pro = await isPro();
  if (!pro) {
    return { success: false, error: "Upgrade to Pro to enable this." };
  }

  const enabled = formData.get("enabled") === "on";
  const programId = String(formData.get("program_id") ?? "");
  // qkit_earn_config.program_id is NOT NULL — a program must be picked
  // whether the vendor is turning the setting on or off.
  if (!programId) {
    return { success: false, error: "Pick a program first." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("qkit_earn_config")
    .upsert(
      { vendor_id: user.id, program_id: programId, enabled },
      { onConflict: "vendor_id" },
    );
  if (error) {
    console.error("saveQkitEarnConfigAction failed", error.message);
    return { success: false, error: "Something went wrong." };
  }

  revalidatePath("/dashboard/profile");
  return { success: true, enabled, programId };
}

export type CustomerNotifySettingsResult = ActionResult<{ enabled: boolean }>;

// Vendor-owned setting: whether redeemAction's customer redemption
// confirmation (notifyCustomerByPhone) fires on this vendor's redemptions.
// Not Pro-gated — every vendor's customers may already have a standing
// merqo Telegram connection via qkit. Same upsert-on-vendor_id shape as
// saveQkitEarnConfigAction above.
export async function saveCustomerNotifySettingsAction(
  formData: FormData,
): Promise<CustomerNotifySettingsResult> {
  const { user } = await requireVendor();
  const enabled = formData.get("enabled") === "on";

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("vendor_notify_settings")
    .upsert(
      { vendor_id: user.id, customer_telegram_notify_enabled: enabled },
      { onConflict: "vendor_id" },
    );
  if (error) {
    console.error("saveCustomerNotifySettingsAction failed", error.message);
    return { success: false, error: "Something went wrong." };
  }

  revalidatePath("/dashboard/profile");
  return { success: true, enabled };
}
