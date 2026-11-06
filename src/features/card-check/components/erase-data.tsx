"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { eraseMyDataAction } from "../api/consent-actions";
import { Button } from "@/components/ui/button";

// Two steps on purpose: erasure is permanent and the card is the only copy of
// the customer's stamps and vouchers.
export function EraseData({
  vendorId,
  phone,
  shopName,
  onErased,
}: {
  vendorId: string;
  phone: string;
  shopName: string | null;
  onErased: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const shop = shopName ?? "this shop";

  function erase() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("vendor", vendorId);
      fd.set("phone", phone);
      const res = await eraseMyDataAction(fd).catch(() => ({
        success: false as const,
        error: "We could not delete your data. Try again.",
      }));
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Your data was deleted.");
      onErased();
    });
  }

  if (!confirming) {
    return (
      <div className="rounded-xl border p-3">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-xs font-semibold text-destructive underline-offset-4 hover:underline"
        >
          Delete my data at this shop
        </button>
      </div>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-label="Confirm deletion"
      className="space-y-3 rounded-xl border border-destructive/40 p-3"
    >
      <p className="text-xs text-muted-foreground">
        This permanently deletes your stamps, rewards and vouchers at {shop},
        along with your phone number and offer choices there. It cannot be
        undone. Other shops are not affected.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={erase}
        >
          {pending ? "Deleting…" : "Yes, delete everything"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => setConfirming(false)}
        >
          Keep my data
        </Button>
      </div>
    </div>
  );
}
