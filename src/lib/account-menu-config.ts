import { submitFeedbackAction } from "@/app/actions/feedback";
import { submitSupportMessageAction } from "@/app/actions/support";
import { SUPPORT_CATEGORY_LABELS } from "@/lib/schemas";
import type { SupportMessageInput } from "@/lib/schemas";

const HELP_CATEGORY_VALUES = Object.keys(
  SUPPORT_CATEGORY_LABELS,
) as SupportMessageInput["category"][];

function isSupportCategory(
  value: string | undefined,
): value is SupportMessageInput["category"] {
  return (HELP_CATEGORY_VALUES as string[]).includes(value ?? "");
}

// One definition of the Get help / Feedback wiring so the dashboard header and
// the landing nav's account menu can't drift apart.
export const ACCOUNT_MENU_HELP = {
  type: "form" as const,
  onSubmit: async ({
    message,
    category,
  }: {
    message: string;
    category?: string;
  }) => {
    const res = await submitSupportMessageAction({
      category: isSupportCategory(category) ? category : "other",
      body: message,
    });
    if (!res.success) throw new Error(res.error);
  },
  categories: HELP_CATEGORY_VALUES.map((value) => ({
    value,
    label: SUPPORT_CATEGORY_LABELS[value],
  })),
};

export async function submitAccountFeedback({
  message,
  nps,
}: {
  message: string;
  nps?: number | null;
}): Promise<void> {
  const res = await submitFeedbackAction({ nps: nps ?? 0, message });
  if (!res.success) throw new Error(res.error);
}
