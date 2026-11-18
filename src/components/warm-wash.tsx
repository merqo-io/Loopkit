"use client";

import { usePathname } from "next/navigation";

// Public pages stay flat; the signed-in, setup and auth screens keep the
// warm wash. Legal pages come from @merqo/ui and the root layout cannot see
// the path, so the wash is a path-aware fixed layer rather than a body rule.
const PUBLIC_PATHS = new Set([
  "/",
  "/about",
  "/faq",
  "/legal/privacy",
  "/legal/terms",
  "/earn",
  "/c",
]);

export function hasWarmWash(pathname: string | null): boolean {
  if (!pathname) return true;
  const normalised =
    pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return !PUBLIC_PATHS.has(normalised);
}

export function WarmWash() {
  const pathname = usePathname();
  if (!hasWarmWash(pathname)) return null;
  return <div aria-hidden="true" className="warm-wash" />;
}
