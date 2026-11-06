import { cn } from "@/lib/utils";
import { ElevatedCard, StatTile } from "@merqo/ui";

/** A back-office figure tile, styled like the dashboard's stat tiles. */
export function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <ElevatedCard className={cn("p-4", className)}>
      <StatTile
        reverse
        label={label}
        value={String(value)}
        valueClassName="font-mono tracking-tight tabular-nums"
      />
    </ElevatedCard>
  );
}
