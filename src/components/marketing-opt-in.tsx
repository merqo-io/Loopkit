"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function MarketingOptIn({ id, text }: { id: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border p-3">
      <Checkbox id={id} name="marketing" value="yes" className="mt-0.5" />
      <Label htmlFor={id} className="text-sm leading-snug font-normal">
        {text}
      </Label>
    </div>
  );
}
