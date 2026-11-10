"use client";
import { FormCard } from "@/components/form-card";

import { useSaveSettings } from "@/hooks/use-save-settings";
import { saveQkitEarnConfigAction } from "./settings-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Label,
  Button,
} from "@merqo/ui/primitives";
import { ElevatedCard } from "@merqo/ui";
import { ProLock } from "@merqo/ui";
import Link from "next/link";

type Program = { id: string; name: string };

export function QkitEarnSettings({
  programs,
  current,
  isPro,
}: {
  programs: Program[];
  current: { programId: string; enabled: boolean } | null;
  isPro: boolean;
}) {
  const { pending, save } = useSaveSettings(saveQkitEarnConfigAction);

  if (!isPro) {
    return (
      <ElevatedCard className="space-y-3 p-4 text-sm text-muted-foreground">
        <p>
          Let customers claim a stamp after completing a qkit order, they get a
          link on their order page and enter their phone number to collect it.
        </p>
        <ProLock
          href="/dashboard/plan"
          label="Upgrade to Pro"
          LinkComponent={Link}
        />
      </ElevatedCard>
    );
  }

  return (
    <FormCard className="space-y-3 p-4" action={save}>
      <div className="flex items-center gap-2">
        <Switch
          id="qkit-earn-enabled"
          name="enabled"
          defaultChecked={current?.enabled ?? false}
          aria-label="Earn from qkit orders"
        />
        <Label htmlFor="qkit-earn-enabled" className="text-sm">
          Earn from qkit orders
        </Label>
      </div>
      <Select name="program_id" defaultValue={current?.programId || undefined}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a program" />
        </SelectTrigger>
        <SelectContent>
          {programs.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-xl text-sm font-semibold"
      >
        Save
      </Button>
    </FormCard>
  );
}
