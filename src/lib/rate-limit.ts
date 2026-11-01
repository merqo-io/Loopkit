import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";

/** Requests per client IP per window, across every anonymous customer action. */
export const ANON_IP_LIMIT = 10;
/** Requests per phone number per window, per action. */
export const ANON_PHONE_LIMIT = 5;
export const ANON_WINDOW_SECONDS = 60;
export const RATE_LIMIT_MESSAGE =
  "Too many tries. Please wait a minute and try again.";

/**
 * Vercel sets x-vercel-forwarded-for itself; the first hop of a raw
 * x-forwarded-for is client-controlled, so it is never read.
 */
export function clientIp(hdrs: Headers): string {
  return (
    hdrs.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

async function hit(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  key: string,
  limit: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: ANON_WINDOW_SECONDS,
  });
  // Fail closed: an anonymous endpoint with no working limiter is open to abuse.
  if (error) return false;
  return data === true;
}

/** True when the call may proceed. Any limiter failure denies. */
export async function allowAnonymousAction(
  action: string,
  phone: string,
): Promise<boolean> {
  try {
    const ip = clientIp(await headers());
    const supabase = await createServiceClient();
    if (!(await hit(supabase, `ip:${ip}`, ANON_IP_LIMIT))) return false;
    return await hit(supabase, `${action}:phone:${phone}`, ANON_PHONE_LIMIT);
  } catch {
    return false;
  }
}
