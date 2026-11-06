export type NewView = "create" | "upsell";

// The query modes that /setup used to switch on, in the precedence the old
// page applied them. Each now has its own route.
const LEGACY_MODES = ["migrate", "edit", "prep", "schedule"] as const;

type LegacyParams = Partial<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Maps an old /setup?<mode>=<id> URL to its sub-route so bookmarks and links
// already sent to vendors keep working. Returns null when the URL has no
// legacy mode (the plain programs list).
export function legacySetupPath(params: LegacyParams): string | null {
  for (const mode of LEGACY_MODES) {
    const id = first(params[mode]);
    if (id) return `/setup/${encodeURIComponent(id)}/${mode}`;
  }
  return null;
}

export function resolveNewView(canCreate: boolean): NewView {
  return canCreate ? "create" : "upsell";
}
