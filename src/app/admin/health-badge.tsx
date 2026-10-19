import { StatusBadge, type StatusBadgeConfig } from "@merqo/ui";
import type { ProgramHealth } from "@/lib/program-health";

// Health → label/color, shared by the triage list and the detail header so the
// two never drift. Rendered through @merqo/ui's StatusBadge, the family's
// dot+pill triage chip. Gold tint = the reward motif for a thriving shop;
// muted for a quiet one; secondary for a fresh signup still finding its feet.
const HEALTH: Record<ProgramHealth, StatusBadgeConfig> = {
  active: {
    label: "Active",
    className: "border-gold/40 bg-gold/15 text-gold-accent",
  },
  new: {
    label: "New",
    className: "border-border bg-secondary text-secondary-foreground",
  },
  quiet: {
    label: "Quiet",
    className: "border-border bg-muted text-muted-foreground",
  },
};

export function ProgramHealthBadge({ health }: { health: ProgramHealth }) {
  return <StatusBadge status={health} config={HEALTH} />;
}
