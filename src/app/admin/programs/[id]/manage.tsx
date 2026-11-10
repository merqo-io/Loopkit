"use client";

import { ConfirmDialog, EmptyState } from "@merqo/ui";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { setProgramActive, removeCard } from "@/app/admin/actions";
import { Button } from "@merqo/ui/primitives";

type ManageCard = {
  id: string;
  phone: string;
  stamp_count: number;
  reward_count: number;
};

/** Active toggle for the whole program + a per-card Remove control. */
export function Manage({
  program,
  cards,
  stampsRequired,
}: {
  program: { id: string; name: string; active: boolean };
  cards: ManageCard[];
  stampsRequired: number;
}) {
  return (
    <div className="space-y-6">
      <ActiveToggle program={program} />
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="border-b px-5 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Cards
        </div>
        {cards.length === 0 ? (
          <EmptyState title="No cards yet." className="m-4 py-6">
            Customers who join this program will show here.
          </EmptyState>
        ) : (
          <ul className="divide-y">
            {cards.map((card) => (
              <li
                key={card.id}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{card.phone}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {card.stamp_count}/{stampsRequired} stamps
                    {card.reward_count > 0 &&
                      ` · ${card.reward_count} reward${card.reward_count === 1 ? "" : "s"}`}
                  </p>
                </div>
                <RemoveCardButton card={card} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ActiveToggle({
  program,
}: {
  program: { id: string; name: string; active: boolean };
}) {
  const router = useRouter();
  const nextActive = !program.active;

  async function confirm() {
    const fd = new FormData();
    fd.set("programId", program.id);
    fd.set("active", String(nextActive));
    const result = await setProgramActive(fd);
    if (!result.success) throw new Error(result.error);
    toast.success(
      `${program.name} is now ${nextActive ? "active" : "inactive"}.`,
    );
    router.refresh();
  }

  const activeActionLabel = program.active ? "Deactivate" : "Reactivate";

  return (
    <ConfirmDialog
      title={`${activeActionLabel} ${program.name}?`}
      description={
        program.active
          ? "Customers will not be able to check their stamps until it is reactivated."
          : "Customers will be able to check their stamps again."
      }
      confirmLabel={activeActionLabel}
      pendingLabel="Saving…"
      onConfirm={confirm}
      trigger={
        <Button
          variant={program.active ? "outline" : "default"}
          size="sm"
          className="rounded-xl"
        >
          {program.active ? "Deactivate program" : "Reactivate program"}
        </Button>
      }
    />
  );
}

function RemoveCardButton({ card }: { card: ManageCard }) {
  const router = useRouter();

  async function confirm() {
    const fd = new FormData();
    fd.set("cardId", card.id);
    const result = await removeCard(fd);
    if (!result.success) throw new Error(result.error);
    toast.success(`Removed ${card.phone}'s card.`);
    router.refresh();
  }

  return (
    <ConfirmDialog
      title="Remove this card?"
      description={`Remove ${card.phone}'s card? This deletes their stamps and history for this shop. It cannot be undone.`}
      confirmLabel="Remove"
      pendingLabel="Removing…"
      onConfirm={confirm}
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Remove card</span>
        </Button>
      }
    />
  );
}
