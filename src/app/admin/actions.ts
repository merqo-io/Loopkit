"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
// eslint-disable-next-line no-restricted-imports -- admin reads rows across vendors that RLS hides; gated by requireAdmin
import { createServiceClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/admin-audit";
import type { ActionResult } from "@merqo/ui/kit-api";

const setProgramActiveSchema = z.object({
  programId: z.uuid(),
  active: z.enum(["true", "false"]).transform((v) => v === "true"),
});

/**
 * Activate or deactivate any vendor's program. Admin-only: requireAdmin() 404s
 * non-admins before any write. Uses the service-role client (allowed in Server
 * Actions) because RLS scopes program UPDATE to the owning vendor.
 */
export async function setProgramActive(
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireAdmin();

  const parsed = setProgramActiveSchema.safeParse({
    programId: formData.get("programId"),
    active: formData.get("active"),
  });
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const supabase = await createServiceClient();
  const { data: updated, error } = await supabase
    .from("programs")
    .update({ active: parsed.data.active })
    .eq("id", parsed.data.programId)
    .select("id")
    .maybeSingle();
  if (error || !updated) {
    console.error(
      "setProgramActive failed",
      error?.message ?? "no row updated",
    );
    return { success: false, error: "Could not update program" };
  }

  await recordAudit(user.id, "set_program_active", parsed.data.programId, {
    active: parsed.data.active,
  });

  revalidatePath("/admin/programs");
  revalidatePath(`/admin/programs/${parsed.data.programId}`);
  return { success: true };
}

const removeCardSchema = z.object({ cardId: z.uuid() });

/**
 * Remove a customer's card (light moderation — a wrong number, an abusive
 * entry). Deleting the card cascades its stamp_events. Admin-only, service-role.
 */
export async function removeCard(formData: FormData): Promise<ActionResult> {
  const { user } = await requireAdmin();

  const parsed = removeCardSchema.safeParse({ cardId: formData.get("cardId") });
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const supabase = await createServiceClient();
  // The card's program is needed to revalidate the detail page it was removed
  // from; read it before the delete removes the row.
  const { data: card } = await supabase
    .from("cards")
    .select("program_id")
    .eq("id", parsed.data.cardId)
    .maybeSingle();
  if (!card) return { success: false, error: "Card not found" };

  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("id", parsed.data.cardId);
  if (error) {
    console.error("removeCard failed", error.message);
    return { success: false, error: "Could not remove card" };
  }

  await recordAudit(user.id, "remove_card", parsed.data.cardId, {
    program_id: card.program_id,
  });

  revalidatePath(`/admin/programs/${card.program_id}`);
  return { success: true };
}
