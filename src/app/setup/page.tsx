import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isPro, canPrepProgram, getEntitlement } from "@/lib/program";
import { activateProgramAction } from "@/app/setup/actions";
import { loadSetupContext } from "@/app/setup/setup-context";
import { SetupShell } from "@/app/setup/setup-shell";
import { legacySetupPath } from "@/app/setup/setup-view";
import { cn } from "@merqo/ui/primitives";

export const metadata: Metadata = { title: "Programs" };

const typeLabel: Record<string, string> = {
  stamp: "Stamp card",
  lucky: "Lucky Tap",
  plant: "Sprout",
  wheel: "Spin the Wheel",
  scratch: "Scratch Card",
};

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const legacy = legacySetupPath(await searchParams);
  if (legacy) redirect(legacy);

  const { vendorName, programs } = await loadSetupContext();
  // A vendor with no program yet goes straight to creating their first one.
  if (programs.length === 0) redirect("/setup/new");

  const pro = await isPro();
  const entitlement = getEntitlement(pro);
  const canPrep = canPrepProgram(
    entitlement,
    programs.filter((p) => p.replaced_by === null).length,
  );
  const activePrograms = programs.filter((p) => p.active);

  // A plain <form action> can only pass the form's formData through a
  // single-argument function, but activateProgramAction shares the
  // (prevState, formData) shape used by every other action here so it plugs
  // into useActionState identically to its siblings. This shim bridges the
  // two.
  async function activate(formData: FormData) {
    "use server";
    await activateProgramAction({}, formData);
  }

  return (
    <SetupShell
      vendorName={vendorName}
      title="Programs"
      description="Manage your loyalty programs."
    >
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="px-7 py-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your programs
            </h2>
            <Link
              href="/setup/new"
              className="text-sm font-medium text-primary hover:underline"
            >
              + New program
            </Link>
          </div>
          <ul className="mt-4 divide-y">
            {programs.map((program) => (
              <li
                key={program.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{program.name}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider ring-1 ring-inset",
                        program.active
                          ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-400/15 dark:text-emerald-400 dark:ring-emerald-400/30"
                          : "bg-secondary text-muted-foreground ring-border",
                      )}
                    >
                      {program.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {typeLabel[program.type] ?? program.type}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                  <Link
                    href={`/setup/${program.id}/edit`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Edit
                  </Link>
                  {program.active && (
                    <Link
                      href={`/setup/${program.id}/migrate`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Change type
                    </Link>
                  )}
                  {program.active && !pro && canPrep && (
                    <Link
                      href={`/setup/${program.id}/prep`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Prep replacement
                    </Link>
                  )}
                  {!program.active && program.replaced_by === null && (
                    <form action={activate}>
                      <input type="hidden" name="id" value={program.id} />
                      <button
                        type="submit"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Activate
                      </button>
                    </form>
                  )}
                  {program.active && pro && activePrograms.length > 1 && (
                    <Link
                      href={`/setup/${program.id}/schedule`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Schedule retirement
                    </Link>
                  )}
                  <Link
                    href={`/dashboard?p=${program.id}`}
                    className="text-primary hover:underline"
                  >
                    Manage
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SetupShell>
  );
}
