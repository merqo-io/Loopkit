"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wordmark } from "@/components/landing/wordmark";
import { AsyncSubmitButton, AuthShell, InfoTooltip } from "@merqo/ui";
import { GoogleMark } from "@merqo/ui";
import { Button, Input, Label } from "@merqo/ui/primitives";
import { createClient } from "@/lib/supabase/client";
import { useAsyncAction, navigatingAway } from "@merqo/ui";
import {
  PASSWORD_REQUIREMENTS_HINT,
  weakPasswordErrorMessage,
} from "./weak-password";
import { loginSchema, type LoginInput } from "@/lib/schemas";

type Mode = "signin" | "signup";

function signUpErrorMessage(error: unknown): string {
  return (
    weakPasswordErrorMessage(error) ??
    "Could not create your account. Check your details, or sign in if you already have one."
  );
}

function SignupPasswordHint({ isSignin }: { isSignin: boolean }) {
  if (isSignin) return null;
  return (
    <InfoTooltip
      ariaLabel="Password requirements"
      trigger="tap"
      content={PASSWORD_REQUIREMENTS_HINT}
    />
  );
}

type Sent = { email: string; kind: "signup" | "reset" };

function HomeWordmark({ className }: { className: string }) {
  return (
    <Link
      href="/"
      aria-label="loopkit home"
      className="inline-block transition-opacity hover:opacity-80"
    >
      <Wordmark className={className} />
    </Link>
  );
}

function SentNotice({ sent, onBack }: { sent: Sent; onBack: () => void }) {
  const isReset = sent.kind === "reset";
  return (
    <AuthShell
      align="center"
      wordmark={<HomeWordmark className="text-2xl" />}
      title="Check your email"
      subtitle={
        isReset ? (
          <>
            We sent a password reset link to{" "}
            <span className="font-medium text-foreground">{sent.email}</span>.
            Open it to choose a new password.
          </>
        ) : (
          <>
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{sent.email}</span>.
            Click it to activate your account, then sign in.
          </>
        )
      }
    >
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-xl"
        onClick={onBack}
      >
        Back to sign in
      </Button>
    </AuthShell>
  );
}

const LINK_EXPIRED_MESSAGE =
  "That link is invalid or has expired. Request a new one.";

function FormError({
  message,
  linkExpired,
}: {
  message: string | null;
  linkExpired: boolean;
}) {
  const shown = message ?? (linkExpired ? LINK_EXPIRED_MESSAGE : null);
  if (!shown) return null;
  return (
    <p
      id="form-error"
      role="alert"
      className="text-sm font-medium text-destructive"
    >
      {shown}
    </p>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "signup" ? "signup" : "signin",
  );
  const { pending: busy, run } = useAsyncAction((fn: () => Promise<void>) =>
    fn(),
  );
  // Set once we've emailed the user and are waiting on their click:
  // "signup" = confirm the new account, "reset" = choose a new password.
  const [sent, setSent] = useState<Sent | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  // Form-level failure from Supabase, shown inline so it stays visible and
  // is announced by screen readers (a toast disappears).
  const [formError, setFormError] = useState<string | null>(null);

  const isSignin = mode === "signin";
  const submitLabel = isSignin ? "Sign in" : "Create account";

  function signInWithGoogle() {
    setFormError(null);
    return run(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { hl: "en" },
        },
      });
      // On success the browser navigates to Google; only an early error lands here.
      if (error) {
        console.error("Google sign-in failed", error);
        setFormError("Could not start Google sign-in. Try again.");
      }
    });
  }

  function onSubmit(data: LoginInput) {
    setFormError(null);
    return run(async () => {
      const supabase = createClient();

      if (mode === "signup") {
        // Land the confirmation-email link back on loopkit — the project's Site URL
        // points at another kit (shared Supabase), so without this the confirm
        // link would bounce the vendor to the wrong app.
        const { data: result, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          console.error("Sign-up failed", error);
          setFormError(signUpErrorMessage(error));
          return;
        }
        // Email confirmation on → no session yet. Show a "check your email" state
        // instead of bouncing to a dashboard the user can't reach.
        if (!result.session) {
          setSent({ email: data.email, kind: "signup" });
          return;
        }
        router.push("/dashboard");
        router.refresh();
        await navigatingAway();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) {
        console.error("Sign-in failed", error);
        setFormError(
          "Could not sign in. Check your email and password and try again.",
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
      await navigatingAway();
    });
  }

  // Email a password-reset link. The link lands on /auth/callback, which
  // establishes a recovery session and forwards to /reset-password.
  function sendReset() {
    setFormError(null);
    const email = getValues("email");
    const parsed = loginSchema.shape.email.safeParse(email);
    if (!parsed.success) {
      setError("email", {
        message: "Enter your email above, then select Forgot password.",
      });
      return;
    }
    clearErrors("email");
    return run(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        console.error("Password reset email failed", error);
        setFormError("Could not send the reset link. Try again in a moment.");
        return;
      }
      setSent({ email, kind: "reset" });
    });
  }

  if (sent) {
    return (
      <SentNotice
        sent={sent}
        onBack={() => {
          setSent(null);
          setMode("signin");
        }}
      />
    );
  }

  return (
    <AuthShell
      wordmark={<HomeWordmark className="text-3xl" />}
      tagline="Loyalty for Singapore's small vendors."
      title={isSignin ? "Welcome back" : "Create your account"}
      subtitle={
        isSignin
          ? "Sign in to your loopkit dashboard."
          : "Set up a loopkit account in seconds."
      }
    >
      <Button
        type="button"
        variant="outline"
        onClick={signInWithGoogle}
        disabled={busy}
        className="h-12 w-full gap-2.5 rounded-xl text-[0.95rem] font-medium"
      >
        <GoogleMark />
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          or with email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@business.sg"
            className="h-11 rounded-xl text-base"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email", {
              onChange: () => clearErrors("email"),
            })}
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="text-sm font-medium text-destructive"
            >
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Password
              </Label>
              <SignupPasswordHint isSignin={isSignin} />
            </div>
            {isSignin && (
              <button
                type="button"
                onClick={sendReset}
                disabled={busy}
                className="text-xs font-semibold text-primary underline-offset-4 hover:underline disabled:opacity-50"
              >
                Forgot password?
              </button>
            )}
          </div>
          <Input
            id="password"
            type="password"
            autoComplete={isSignin ? "current-password" : "new-password"}
            placeholder="••••••••"
            className="h-11 rounded-xl text-base"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p
              id="password-error"
              className="text-sm font-medium text-destructive"
            >
              {errors.password.message}
            </p>
          )}
        </div>
        <FormError
          message={formError}
          linkExpired={searchParams.get("error") === "link"}
        />
        <AsyncSubmitButton
          pending={busy}
          pendingChildren="Please wait…"
          className="h-12 w-full rounded-xl text-base font-semibold"
        >
          {submitLabel}
        </AsyncSubmitButton>
      </form>

      <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
        {isSignin ? "New to loopkit? " : "Already have an account? "}
        <button
          type="button"
          className="font-semibold text-primary underline-offset-4 hover:underline"
          onClick={() => {
            setFormError(null);
            setMode(isSignin ? "signup" : "signin");
          }}
        >
          {isSignin ? "Create an account" : "Sign in"}
        </button>
      </p>
    </AuthShell>
  );
}
