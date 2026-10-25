/**
 * True when a cookie-authenticated request came from this site's own pages.
 * Browsers send `Sec-Fetch-Site` on every request; `Origin` backs it up for
 * clients that do not. A request with neither is refused.
 */
export function isSameOrigin(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}
