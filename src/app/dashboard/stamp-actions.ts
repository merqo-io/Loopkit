"use server";

import { qrSvg } from "@merqo/ui";
import { revalidatePath } from "next/cache";
import { requireVendor } from "@/features/auth";
import { normalizePhone } from "@/lib/phone";
import { rewardReady } from "@/lib/loyalty";
import { applyVisit, getProgress } from "@/lib/engine";
import { isCardExpired } from "@/lib/expiry";
import { createServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/action-result";
import type { Progress } from "@/lib/engine/types";
import type { Json } from "@/lib/types";
import { programFromForm } from "./actions-shared";
import type { CardResult } from "./actions-shared";

// Add a stamp to the phone's card (add_stamp no longer caps at the requirement — it increments unconditionally).
export async function stampAction(formData: FormData): Promise<CardResult> {
  await requireVendor();

  const program = await programFromForm(formData);
  if (!program) {
    return { success: false, error: "Set up your card first." };
  }

  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  if (!normalized.ok) {
    return { success: false, error: "Enter a valid Singapore phone number." };
  }

  const supabase = await createServerClient();
  const { data: existingCycle } = await supabase
    .from("cards")
    .select("cycle_started_at")
    .eq("program_id", program.id)
    .eq("phone", normalized.phone)
    .maybeSingle();
  if (
    existingCycle &&
    isCardExpired(
      existingCycle.cycle_started_at,
      program.expiry_days,
      new Date(),
    )
  ) {
    return {
      success: false,
      error: "This card has expired. Regenerate it to start a new cycle.",
    };
  }

  const { data: card, error } = await supabase.rpc("add_stamp", {
    p_program: program.id,
    p_phone: normalized.phone,
  });
  if (error || !card) {
    console.error("add_stamp failed", error);
    return { success: false, error: "Something went wrong. Try again." };
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    card: { id: card.id, phone: card.phone, stamp_count: card.stamp_count },
    rewardReady: getProgress(
      {
        type: program.type,
        config: program.config,
        stamps_required: program.stamps_required,
        reward_text: program.reward_text,
      },
      { state: {}, stamp_count: card.stamp_count, reward_count: 0 },
      new Date(),
    ).rewardReady,
  };
}

// Manual correction for classic Stamp-type programs; requires an existing card and a reason, never creates one.
export async function adjustStampAction(
  formData: FormData,
): Promise<CardResult> {
  await requireVendor();

  const program = await programFromForm(formData);
  if (!program) {
    return { success: false, error: "Set up your card first." };
  }

  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  if (!normalized.ok) {
    return { success: false, error: "Enter a valid Singapore phone number." };
  }

  const delta = Number(formData.get("delta"));
  if (!Number.isInteger(delta) || delta === 0) {
    return { success: false, error: "Enter a nonzero whole number." };
  }

  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length === 0) {
    return { success: false, error: "A reason is required." };
  }

  const supabase = await createServerClient();
  const { data: card, error } = await supabase.rpc("adjust_stamp", {
    p_program: program.id,
    p_phone: normalized.phone,
    p_delta: delta,
    p_reason: reason,
  });
  if (error || !card) {
    console.error("adjust_stamp failed", error);
    return {
      success: false,
      error: "No card found for this customer, or something went wrong.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/customers/${normalized.phone}`);
  return {
    success: true,
    card: { id: card.id, phone: card.phone, stamp_count: card.stamp_count },
    rewardReady: rewardReady(card.stamp_count, program.stamps_required),
  };
}

type VisitResult = ActionResult<{
  rewardUnlocked: boolean;
  progress: Progress;
  reward_text: string;
  phone: string;
}>;

// Generic engine play path for non-stamp types (Lucky Tap, Sprout). The pure
// strategy computes the next card state from a server-generated roll —
// randomness never comes from the client — and record_visit persists it and
// logs the event. Fresh per-type progress is derived so the client can render it.
export async function recordVisitAction(
  formData: FormData,
): Promise<VisitResult> {
  await requireVendor();
  const program = await programFromForm(formData);
  if (!program) return { success: false, error: "Set up your card first." };
  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  if (!normalized.ok) {
    return { success: false, error: "Enter a valid Singapore phone number." };
  }

  const supabase = await createServerClient();
  const { data: existing, error: readError } = await supabase
    .from("cards")
    .select(
      "id,phone,stamp_count,reward_count,state,cycle_started_at,updated_at",
    )
    .eq("program_id", program.id)
    .eq("phone", normalized.phone)
    .maybeSingle();

  if (readError) {
    return { success: false, error: "Could not read this card. Try again." };
  }
  const now = new Date();
  if (
    existing &&
    isCardExpired(existing.cycle_started_at, program.expiry_days, now)
  ) {
    return {
      success: false,
      error: "This card has expired. Regenerate it to start a new cycle.",
    };
  }

  const card = existing ?? { state: {}, stamp_count: 0, reward_count: 0 };
  const event = { kind: "visit" as const, payload: { roll: Math.random() } };
  const { state, rewardUnlocked } = applyVisit(program, card, event, now);

  const { error } = await supabase.rpc("record_visit_checked", {
    p_expected_updated_at: existing?.updated_at ?? null,
    p_program: program.id,
    p_phone: normalized.phone,
    p_state: state as Json,
    p_kind: "visit",
    p_payload: { won: rewardUnlocked, roll: event.payload.roll },
  });
  if (error) {
    if (error.code === "40001") {
      return {
        success: false,
        error: "This card changed. Refresh and try again.",
      };
    }
    console.error("record_visit failed", error.message);
    return { success: false, error: "Something went wrong. Try again." };
  }

  const progress = getProgress(
    program,
    { state, stamp_count: 0, reward_count: 0 },
    now,
  );

  revalidatePath("/dashboard");
  return {
    success: true,
    rewardUnlocked,
    progress,
    reward_text:
      (program.config as { reward_text?: string })?.reward_text ??
      program.reward_text,
    phone: normalized.phone,
  };
}

// The database checks readiness and resets the locked card atomically.
export async function redeemPlantAction(
  formData: FormData,
): Promise<ActionResult<{ phone: string; progress: Progress }>> {
  await requireVendor();
  const program = await programFromForm(formData);
  if (!program) return { success: false, error: "Set up your card first." };
  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  if (!normalized.ok) {
    return { success: false, error: "Enter a valid Singapore phone number." };
  }

  if (program.type !== "plant") {
    return { success: false, error: "This card is not a plant." };
  }
  const supabase = await createServerClient();
  const { data: card, error } = await supabase.rpc("redeem_plant", {
    p_program: program.id,
    p_phone: normalized.phone,
  });
  if (error || !card) {
    return {
      success: false,
      error: "This reward is not ready or the card has expired.",
    };
  }
  const progress = getProgress(program, card, new Date());

  revalidatePath("/dashboard");
  return { success: true, phone: normalized.phone, progress };
}

// Owning-vendor recovery rotates credentials while preserving earned progress.
export async function regenerateCardAction(
  formData: FormData,
): Promise<ActionResult<{ phone: string; cardToken: string; qr: string }>> {
  await requireVendor();
  const program = await programFromForm(formData);
  if (!program) return { success: false, error: "Set up your card first." };
  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  if (!normalized.ok) {
    return { success: false, error: "Enter a valid Singapore phone number." };
  }

  const supabase = await createServerClient();
  const { data: card, error } = await supabase.rpc("recover_customer_card", {
    p_program: program.id,
    p_phone: normalized.phone,
  });
  if (error || !card) {
    return { success: false, error: "Something went wrong. Try again." };
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    phone: normalized.phone,
    cardToken: card.card_token,
    qr: await qrSvg(card.card_token),
  };
}
