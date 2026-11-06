import { requireVendor } from "@/features/auth";
import { getVendorProfile } from "@/lib/vendor";
import { createServerClient } from "@/lib/supabase/server";
import { getOrCreateVendorProfile } from "@/lib/merqo-vendor-profile";
import { ProfileForm } from "@/app/dashboard/profile/profile-form";
import { listPrograms, isPro } from "@/lib/program";
import { QkitEarnSettings } from "@/app/dashboard/qkit-earn-settings";
import { CustomerNotifySettings } from "@/app/dashboard/customer-notify-settings";
import { PageHeader } from "@/components/page-header";
import type { SocialLinks } from "@/lib/types";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { user } = await requireVendor();
  const rawDisplayName = user.user_metadata?.display_name;
  const displayName = typeof rawDisplayName === "string" ? rawDisplayName : "";
  const profile = await getVendorProfile();

  const supabase = await createServerClient();
  const [programs, pro, qkitEarnConfigResult, notifySettingsResult] =
    await Promise.all([
      listPrograms(),
      isPro(),
      supabase
        .from("qkit_earn_config")
        .select("program_id, enabled")
        .eq("vendor_id", user.id)
        .maybeSingle(),
      supabase
        .from("vendor_notify_settings")
        .select("customer_telegram_notify_enabled")
        .eq("vendor_id", user.id)
        .maybeSingle(),
    ]);
  const qkitEarnConfig = qkitEarnConfigResult.data;
  const notifySettings = notifySettingsResult.data;
  // Same cross-schema, degrade-to-empty-on-failure pattern as /setup's page
  // (src/app/setup/page.tsx) — social links are a nice-to-have, not worth
  // hard-failing the whole profile page over a merqo hiccup.
  let socialLinks: SocialLinks = {};
  try {
    const vendorProfile = await getOrCreateVendorProfile(
      supabase,
      user.id,
      profile.name,
    );
    socialLinks = vendorProfile.social_links as SocialLinks;
  } catch (err) {
    console.error(
      "profile: shared vendor profile read failed",
      err instanceof Error ? err.message : err,
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 md:max-w-4xl">
      <PageHeader eyebrow="Your account" title="Profile" className="mb-0">
        Your stall name, social links, profile icon, how we address you, your
        sign-in password, and the tools loopkit connects to. Each section saves
        on its own.
      </PageHeader>
      <ProfileForm
        vendorId={user.id}
        email={user.email ?? ""}
        name={profile.name}
        avatarUrl={user.user_metadata?.avatar_url ?? null}
        displayName={displayName}
        socialLinks={socialLinks}
      />
      <section id="integrations" className="space-y-8">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            qkit integration
          </h2>
          <QkitEarnSettings
            programs={programs
              .filter((prog) => prog.type === "stamp")
              .map((prog) => ({ id: prog.id, name: prog.name }))}
            current={
              qkitEarnConfig
                ? {
                    programId: qkitEarnConfig.program_id,
                    enabled: qkitEarnConfig.enabled,
                  }
                : null
            }
            isPro={pro}
          />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Customer notifications
          </h2>
          <CustomerNotifySettings
            current={
              notifySettings
                ? { enabled: notifySettings.customer_telegram_notify_enabled }
                : null
            }
          />
        </div>
      </section>
    </div>
  );
}
