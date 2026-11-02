import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";

/** Requests per client IP per window; high because shops share Wi-Fi and carrier NAT. */
export const ANON_IP_LIMIT = 30;
/** Requests per (phone, IP) pair per window, per action. */
export const ANON_PHONE_IP_LIMIT = 5;
/** Requests per phone per window across all IPs, per action. */
export const ANON_PHONE_LIMIT = 20;
export const ANON_WINDOW_SECONDS = 60;
export const RATE_LIMIT_MESSAGE =
  "Too many tries. Please wait a minute and try again.";

/**
 * Vercel sets x-vercel-forwarded-for itself; the first hop of a raw
 * x-forwarded-for is client-controlled, so it is never read.
 */
export function clientIp(hdrs: Headers): string | null {
  return (
    hdrs.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip")?.trim() ||
    null
  );
}

// Counter rows are short-lived abuse state, not a PII store, so keys carry
// only digests of the phone and IP.
function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function hit(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  key: string,
  limit: number,
): Promise<{ allowed: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: ANON_WINDOW_SECONDS,
  });
  if (error) return { allowed: false, error: error.message };
  return { allowed: data === true };
}

/**
 * True when the call may proceed. Any limiter failure denies (fail closed).
 *
 * The strict phone bucket is keyed on (phone, IP) so a stranger hammering a
 * victim's number from their own IP cannot lock the victim out from theirs;
 * the looser per-phone bucket still caps distributed guessing. Phone buckets
 * are only spent once the IP bucket has passed. Without an IP the IP bucket is
 * skipped rather than shared by every such caller.
 */
export async function allowAnonymousAction(
  action: string,
  phone: string,
): Promise<boolean> {
  try {
    const ip = clientIp(await headers());
    const supabase = await createServiceClient();
    const phoneHash = digest(phone);
    const ipHash = ip ? digest(ip) : "noip";
    const checks: [string, number][] = [];
    if (ip) checks.push([`ip:${ipHash}`, ANON_IP_LIMIT]);
    checks.push(
      [`${action}:phone-ip:${phoneHash}:${ipHash}`, ANON_PHONE_IP_LIMIT],
      [`${action}:phone:${phoneHash}`, ANON_PHONE_LIMIT],
    );
    for (const [key, limit] of checks) {
      const result = await hit(supabase, key, limit);
      if (result.error) {
        console.error(`rate limiter error (${action}): ${result.error}`);
        return false;
      }
      if (!result.allowed) return false;
    }
    return true;
  } catch (e) {
    console.error(
      `rate limiter threw (${action}): ${e instanceof Error ? e.message : "unknown"}`,
    );
    return false;
  }
}
