import { describe, expect, it } from "vitest";
import { isSameOrigin } from "./same-origin";

const req = (headers: Record<string, string>) =>
  new Request("https://loopkit.merqo.io/api/tour-seen", {
    method: "POST",
    headers,
  });

describe("isSameOrigin", () => {
  it("accepts Sec-Fetch-Site same-origin", () => {
    expect(isSameOrigin(req({ "sec-fetch-site": "same-origin" }))).toBe(true);
  });

  it("refuses a sibling subdomain, which is same-site but not same-origin", () => {
    expect(isSameOrigin(req({ "sec-fetch-site": "same-site" }))).toBe(false);
  });

  it("refuses a cross-site request", () => {
    expect(isSameOrigin(req({ "sec-fetch-site": "cross-site" }))).toBe(false);
  });

  it("falls back to Origin when Sec-Fetch-Site is absent", () => {
    expect(isSameOrigin(req({ origin: "https://loopkit.merqo.io" }))).toBe(
      true,
    );
    expect(isSameOrigin(req({ origin: "https://qkit.merqo.io" }))).toBe(false);
  });

  it("refuses a request with neither header", () => {
    expect(isSameOrigin(req({}))).toBe(false);
  });
});
