import { notFound } from "next/navigation";
import { requireVendor } from "@/features/auth";
import { applyDueCutovers, listPrograms } from "@/lib/program";
import { getVendorProfile } from "@/lib/vendor";

// The route's program, or a 404 when the id is not one of the vendor's own.
// An unowned id must never fall through to another program's form.
export async function loadSetupProgram(programId: string) {
  const ctx = await loadSetupContext();
  const program = ctx.programs.find((p) => p.id === programId);
  if (!program) notFound();
  return { ...ctx, program };
}

// Shared by every /setup route: the signed-in vendor, their programs and the
// name shown in the page header. getVendorProfile seeds a brand-new vendor's
// shared merqo row when /setup is the first page they load.
export async function loadSetupContext() {
  const { user } = await requireVendor();
  await applyDueCutovers();
  const profile = await getVendorProfile(user.email ?? null);
  const programs = await listPrograms();
  return {
    vendorName: profile.name,
    vendorAvatarUrl:
      (user.user_metadata?.avatar_url as string | undefined) ?? null,
    programs,
  };
}
