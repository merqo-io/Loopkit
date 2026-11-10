"use client";

import { toast } from "sonner";
import { ConfirmDialog, ElevatedCard } from "@merqo/ui";
import type { MarketingConsentStatus } from "@/lib/customers";
import { formatSgtDate } from "@/lib/format";
import { Button } from "@merqo/ui/primitives";
import { withdrawMarketingConsentAction } from "./actions";

function describe(status: MarketingConsentStatus): string {
  if (!status)
    return "Not opted in. Only the customer can opt in, from your QR.";
  const date = formatSgtDate(status.recordedAt);
  if (status.granted) return `Opted in on ${date}.`;
  return status.vendorRecorded
    ? `Opted out on ${date} (recorded by you).`
    : `Opted out on ${date}.`;
}

export function MarketingConsentPanel({
  phone,
  status,
}: {
  phone: string;
  status: MarketingConsentStatus;
}) {
  async function withdraw() {
    const fd = new FormData();
    fd.set("phone", phone);
    const res = await withdrawMarketingConsentAction(fd);
    if (!res.success) throw new Error(res.error);
    toast.success("Opt-out recorded. No offers will go to this customer.");
  }

  return (
    <ElevatedCard className="space-y-3 p-4">
      <p className="text-sm">{describe(status)}</p>
      {status?.granted && (
        <ConfirmDialog
          title="Record opt-out?"
          description={`Use this when ${phone} asks you to stop sending offers. It takes effect at once. Only the customer can opt in again.`}
          confirmLabel="Record opt-out"
          pendingLabel="Recording…"
          onConfirm={withdraw}
          trigger={
            <Button type="button" variant="outline" size="sm">
              Record opt-out
            </Button>
          }
        />
      )}
    </ElevatedCard>
  );
}
