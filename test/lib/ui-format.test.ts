import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, formatMoney } from "@merqo/ui";

// Pins the @merqo/ui display formats that replaced loopkit's local helpers, so
// a library change to money or SGT formatting fails here, not on a vendor's screen.
describe("formatMoney", () => {
  it("prefixes S$ and keeps two decimals", () => {
    expect(formatMoney(120)).toBe("S$1.20");
    expect(formatMoney(0)).toBe("S$0.00");
  });
  it("groups thousands", () => {
    expect(formatMoney(100000)).toBe("S$1,000.00");
  });
});

describe("formatDate and formatDateTime", () => {
  it("render SGT, not the server zone", () => {
    expect(formatDate("2026-07-07T16:30:00Z")).toBe("8 Jul 2026");
    expect(formatDateTime("2026-07-07T07:04:00Z")).toBe("7 Jul 2026, 3:04 pm");
  });
  it("render a dash for an invalid date", () => {
    expect(formatDate("not-a-date")).toBe("-");
    expect(formatDateTime("not-a-date")).toBe("-");
  });
});
