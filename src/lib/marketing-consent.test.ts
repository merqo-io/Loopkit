import { describe, it, expect } from "vitest";
import {
  MARKETING_CONSENT_VERSION,
  marketingConsentText,
  marketingOptedIn,
} from "./marketing-consent";

describe("marketingConsentText", () => {
  it("names the shop, the channels and the number", () => {
    const text = marketingConsentText("Kaya Toast Co.");
    expect(text).toContain("Kaya Toast Co. may send me offers");
    expect(text).toContain("SMS, WhatsApp or Telegram");
    expect(text).toContain("this phone number");
    expect(text).not.toContain("—");
  });

  it("falls back to 'this shop' for a blank or missing name", () => {
    expect(marketingConsentText(null)).toContain("Yes, this shop may");
    expect(marketingConsentText("  ")).toContain("Yes, this shop may");
  });

  it("has a version short enough for the database check", () => {
    expect(MARKETING_CONSENT_VERSION.length).toBeLessThanOrEqual(40);
  });
});

describe("marketingOptedIn", () => {
  it("is true only for the checked box value", () => {
    const fd = new FormData();
    expect(marketingOptedIn(fd)).toBe(false);
    fd.set("marketing", "on");
    expect(marketingOptedIn(fd)).toBe(false);
    fd.set("marketing", "yes");
    expect(marketingOptedIn(fd)).toBe(true);
  });
});
