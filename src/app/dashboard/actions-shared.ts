import { getProgramById } from "@/lib/program";
import type { ActionResult } from "@merqo/ui/kit-api";
import type { StampCard } from "@/app/dashboard/card";

export type CardResult = ActionResult<{
  card: StampCard;
  rewardReady: boolean;
}>;

// Resolve which of the vendor's programs a counter form is acting on. The form
// carries the current program's id in a hidden input; getProgramById is
// RLS-scoped, so a vendor can only ever resolve their own programs.
export async function programFromForm(formData: FormData) {
  const id = String(formData.get("program_id") ?? "").trim();
  return id ? getProgramById(id) : null;
}
