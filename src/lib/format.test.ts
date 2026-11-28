import { describe, expect, it } from "vitest";
import { formatShortDate, sgtDateKey } from "@/lib/format";

describe("formatShortDate", () => {
  it("renders the SGT day for a YYYY-MM-DD key", () => {
    expect(formatShortDate("2026-09-01")).toBe("1 Sep");
    expect(formatShortDate("2026-12-31")).toBe("31 Dec");
  });

  it("round-trips an SGT day key without shifting the day", () => {
    const key = sgtDateKey("2026-07-09T17:30:00.000Z");
    expect(key).toBe("2026-07-10");
    expect(formatShortDate(key)).toBe("10 Jul");
  });
});
