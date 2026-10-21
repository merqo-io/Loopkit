"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ElevatedCard } from "@merqo/ui";
import { useAsyncAction } from "@/hooks/use-async-action";
import type { MarketingConsentStatus } from "@/lib/customers";
import { formatSgtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const { pending, run } = useAsyncAction();
  const [open, setOpen] = useState(false);

  function withdraw() {
    run(async () => {
      const fd = new FormData();
      fd.set("phone", phone);
      const res = await withdrawMarketingConsentAction(fd);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setOpen(false);
      toast.success("Opt-out recorded. No offers will go to this customer.");
    });
  }

  return (
    <ElevatedCard className="space-y-3 p-4">
      <p className="text-sm">{describe(status)}</p>
      {status?.granted && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              Record opt-out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Record opt-out?</AlertDialogTitle>
              <AlertDialogDescription>
                Use this when {phone} asks you to stop sending offers. It takes
                effect at once. Only the customer can opt in again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={pending}
                onClick={(e) => {
                  e.preventDefault();
                  withdraw();
                }}
              >
                {pending ? "Recording…" : "Record opt-out"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ElevatedCard>
  );
}
