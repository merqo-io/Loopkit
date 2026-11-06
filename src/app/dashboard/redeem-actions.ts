"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireVendor } from "@/features/auth";
import { createServerClient } from "@/lib/supabase/server";
import {
  notifyVendor,
  notifyCustomerByPhone,
} from "@/lib/merqo-customer-notify";
import type { ActionResult } from "@/lib/action-result";
import type { CardResult } from "./actions-shared";

// Fire-and-forget alert: routed through merqo's shared Telegram bot
// (Phase A2) rather than a local table lookup — loopkit no longer runs
// its own bot, vendors connect once via merqo's profile page instead.
// Any failure is caught and logged — this must NEVER affect
// redeemAction's own returned result.
async function notifyRedemptionOnTelegram(
  vendorId: string,
  card: { phone: string; stamp_count: number },
): Promise<void> {
  try {
    await notifyVendor(
      vendorId,
      `Reward redeemed for ${card.phone} (${card.stamp_count} stamps).`,
    );
  } catch (err) {
    console.error("redeemAction: telegram alert failed", err);
  }
}

// A vendor's customer-notify preference. A row absent entirely (vendor never
// visited the settings page) resolves to "enabled" here — the column default
// alone isn't enough, since a lookup that finds no row returns null data, not
// the table's default value.
async function customerNotifyEnabled(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  vendorId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("vendor_notify_settings")
    .select("customer_telegram_notify_enabled")
    .eq("vendor_id", vendorId)
    .maybeSingle();
  return data?.customer_telegram_notify_enabled !== false;
}

// Redeem a full card: resets stamps to 0 and logs the reward. Returns the
// reset card so the UI can replace the reward-ready block with a confirmation.
export async function redeemAction(formData: FormData): Promise<CardResult> {
  const { user } = await requireVendor();

  const parsed = z.string().min(1).safeParse(formData.get("card_id"));
  if (!parsed.success) {
    return { success: false, error: "Missing card." };
  }

  const supabase = await createServerClient();
  const { data: card, error } = await supabase.rpc("redeem", {
    p_card: parsed.data,
  });
  if (error || !card) {
    console.error("redeem failed", error);
    return { success: false, error: "Something went wrong. Try again." };
  }

  revalidatePath("/dashboard");

  await notifyRedemptionOnTelegram(user.id, {
    phone: card.phone,
    stamp_count: card.stamp_count,
  });

  // Sibling fire-and-forget call: notifyCustomerByPhone already catches its
  // own errors internally, but this wraps the call site too so a mocked or
  // unforeseen rejection still can't change redeemAction's own result —
  // same "never affects redemption itself" rule as the vendor alert above.
  // Gated on the vendor's own on/off toggle: only skip the call when a row
  // exists AND the flag is explicitly false — a missing row still means on.
  try {
    if (await customerNotifyEnabled(supabase, user.id)) {
      await notifyCustomerByPhone(
        user.id,
        card.phone,
        `Reward redeemed: ${card.stamp_count} stamps used. See you again soon!`,
      );
    }
  } catch (err) {
    console.error("redeemAction: customer notify failed", err);
  }

  return {
    success: true,
    card: { id: card.id, phone: card.phone, stamp_count: card.stamp_count },
    rewardReady: false,
  };
}

const VOUCHER_ERROR_COPY: Record<string, string> = {
  already_redeemed: "This reward has already been redeemed.",
  expired: "This reward has expired.",
};

// Vendor scan/confirm redemption for one catalog-mode reward voucher —
// distinct from redeemAction, which still redeems Stamp/Plant's single
// fixed reward via the oldest-active-voucher path.
export async function redeemVoucherAction(
  formData: FormData,
): Promise<ActionResult<{ rewardText: string }>> {
  await requireVendor();

  const token = String(formData.get("token") ?? "").trim();
  if (!token) {
    return { success: false, error: "Missing code." };
  }

  const supabase = await createServerClient();
  const { data: voucher, error } = await supabase.rpc(
    "redeem_voucher_by_token",
    { p_token: token },
  );
  if (error || !voucher) {
    console.error("redeem_voucher_by_token failed", error);
    return {
      success: false,
      error:
        VOUCHER_ERROR_COPY[error?.message ?? ""] ??
        "Something went wrong. Try again.",
    };
  }

  revalidatePath("/dashboard");
  return { success: true, rewardText: voucher.reward_text };
}

// Vendor-initiated at the register for an offset-mode Points Club
// program: deducts p_points from the scanned card's balance and returns
// the dollar figure for the vendor to apply manually at their own
// register — loopkit never touches payment processing.
export async function applyPointsOffsetAction(
  formData: FormData,
): Promise<
  ActionResult<{ phone: string; stampCount: number; dollars: number }>
> {
  await requireVendor();

  const cardId = String(formData.get("card_id") ?? "").trim();
  if (!cardId) {
    return { success: false, error: "Missing card." };
  }
  const points = Number(formData.get("points"));
  if (!Number.isInteger(points) || points <= 0) {
    return { success: false, error: "Enter a whole number of points." };
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("apply_points_offset", {
    p_card: cardId,
    p_points: points,
  });
  const row = data?.[0];
  if (error || !row) {
    console.error("apply_points_offset failed", error);
    return { success: false, error: "Something went wrong. Try again." };
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    phone: row.phone,
    stampCount: row.stamp_count,
    dollars: row.dollars,
  };
}
