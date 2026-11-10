"use client";

import { useRouter } from "next/navigation";
import { MfaForm as SharedMfaForm, navigatingAway } from "@merqo/ui";
import { createClient } from "@/lib/supabase/client";

type Props = {
  verifiedFactorId: string | null;
  staleFactorIds: string[];
};

const COPY = {
  enrol: "Could not start setup. Try again.",
  verify: "That code did not work. Check the time on your phone and try again.",
  missingFactor: "Enter the 6-digit code from your authenticator app.",
};

// Every failure becomes one of the fixed strings above before it reaches the
// shared form, so this identity mapper never shows a raw Supabase message.
const showAsIs = (message: string) => message;

export function MfaForm({ verifiedFactorId, staleFactorIds }: Props) {
  const router = useRouter();

  async function onEnrol() {
    try {
      const supabase = createClient();
      for (const id of staleFactorIds) {
        await supabase.auth.mfa.unenroll({ factorId: id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      if (error || !data) return COPY.enrol;
      return {
        qr: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id,
      };
    } catch {
      return COPY.enrol;
    }
  }

  async function onVerify(code: string, context: { factorId?: string }) {
    const factorId = context.factorId ?? verifiedFactorId;
    if (!factorId) return COPY.missingFactor;
    try {
      const { error } = await createClient().auth.mfa.challengeAndVerify({
        factorId,
        code,
      });
      if (error) return COPY.verify;
    } catch {
      return COPY.verify;
    }
    router.replace("/admin");
    router.refresh();
    await navigatingAway();
  }

  return (
    <SharedMfaForm
      hasFactor={verifiedFactorId !== null}
      onEnrol={onEnrol}
      onVerify={onVerify}
      mapError={showAsIs}
    />
  );
}
