import { headers } from "next/headers";
import {
  clientIp as sharedClientIp,
  digest,
  rateLimitCheck,
  type RateLimitStore,
} from "@merqo/ui/kit-api";
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
  return sharedClientIp(hdrs, {
    trustedHeaders: ["x-vercel-forwarded-for", "x-real-ip"],
  });
}

type ServiceClient = Awaited<ReturnType<typeof createServiceClient>>;

// Counter rows live in this kit's own schema, so the shared limiter gets a
// store bound to the check_rate_limit RPC.
function rpcStore(supabase: ServiceClient): RateLimitStore {
  return {
    async hit(key, limit, windowSeconds) {
      const { data, error } = await supabase.rpc("check_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });
      if (error) throw new Error(error.message);
      return data === true;
    },
  };
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
    const store = rpcStore(await createServiceClient());
    const phoneHash = digest(phone);
    const ipHash = ip ? digest(ip) : "noip";
    const checks: [string, number][] = [];
    if (ip) checks.push([`ip:${ipHash}`, ANON_IP_LIMIT]);
    checks.push(
      [`${action}:phone-ip:${phoneHash}:${ipHash}`, ANON_PHONE_IP_LIMIT],
      [`${action}:phone:${phoneHash}`, ANON_PHONE_LIMIT],
    );
    for (const [key, limit] of checks) {
      const verdict = await rateLimitCheck(
        store,
        key,
        limit,
        ANON_WINDOW_SECONDS,
      );
      if (verdict === "error") {
        console.error(`rate limiter error (${action})`);
        return false;
      }
      if (verdict === "limited") return false;
    }
    return true;
  } catch (e) {
    console.error(
      `rate limiter threw (${action}): ${e instanceof Error ? e.message : "unknown"}`,
    );
    return false;
  }
}
