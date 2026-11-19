"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/landing/wordmark";
import { Input, Label } from "@merqo/ui/primitives";
import { AsyncSubmitButton, AuthShell, InfoTooltip } from "@merqo/ui";
import {
  PASSWORD_REQUIREMENTS_HINT,
  weakPasswordErrorMessage,
} from "./weak-password";

// Reached from the password-reset email → /auth/callback establishes a recovery
// session and forwards here. We update the password on that session, then land
// the user in their dashboard.
const resetSchema = z
  .object({ password: z.string().min(8).max(72), confirm: z.string() })
  .refine((value) => value.password === value.confirm, {
    message: "Passwords do not match.",
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = resetSchema.safeParse({ password, confirm });
    if (!parsed.success) {
      setError(
        password !== confirm
          ? "Passwords do not match."
          : "Use between 8 and 72 characters.",
      );
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: parsed.data.password,
      });
      if (error) {
        console.error("Password update failed", error);
        setError(
          weakPasswordErrorMessage(error) ??
            "Could not update your password. Try again.",
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not update your password. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      wordmark={<Wordmark className="text-3xl" />}
      title="Choose a new password"
      subtitle="Enter it twice to confirm."
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              New password
            </Label>
            <InfoTooltip
              ariaLabel="Password requirements"
              trigger="tap"
              content={PASSWORD_REQUIREMENTS_HINT}
            />
          </div>
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-11 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="confirm"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Confirm password
          </Label>
          <Input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="h-11 rounded-xl"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <AsyncSubmitButton
          pending={busy}
          pendingChildren="Saving…"
          className="h-12 w-full rounded-xl text-base font-semibold"
        >
          Update password
        </AsyncSubmitButton>
      </form>
    </AuthShell>
  );
}
