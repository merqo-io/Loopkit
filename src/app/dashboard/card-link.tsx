"use client";

import { toast } from "sonner";
import { Printer } from "lucide-react";
import { CopyButton } from "@merqo/ui";
import { Button } from "@merqo/ui/primitives";

export function CardLinkActions({ link }: { link: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyButton
        value={link}
        label="Copy link"
        className="rounded-lg"
        onCopied={() => toast.success("Link copied")}
        onError={() =>
          toast.error("Could not copy, long-press the link to copy it.")
        }
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="rounded-lg"
      >
        <Printer className="size-4" />
        Print QR
      </Button>
    </div>
  );
}
