import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CHECK_BUTTON,
  COUNTER_TITLE,
  JOIN_NOTE,
  REDEEM_BUTTON,
  REWARD_READY,
  STAMP_BUTTON,
} from "./card-labels";

const src = (p: string) => readFileSync(join(process.cwd(), "src", p), "utf8");

// The landing mock-ups quote the product's own strings; if the app changes
// one, this fails so the landing is updated with it.
describe("landing labels match the app source", () => {
  it("quotes the counter and customer-card strings", () => {
    expect(src("app/dashboard/counter/use-serve-customer.ts")).toContain(
      `stamp: { idle: "${STAMP_BUTTON}"`,
    );
    expect(src("app/dashboard/counter/use-serve-customer.ts")).toContain(
      "`Stamped ${res.card.phone}, ${res.card.stamp_count}/${stampsRequired}`",
    );
    expect(src("app/dashboard/counter/page.tsx")).toContain(
      `title="${COUNTER_TITLE}"`,
    );
    expect(src("app/dashboard/counter/active-card.tsx")).toContain(
      "/ {stampsRequired} stamps",
    );
    expect(
      src("features/card-check/components/program-card-status.tsx"),
    ).toContain("Reward: {card.reward_text}");
    expect(src("app/dashboard/redeem-button.tsx")).toContain(
      `confirmLabel="${REDEEM_BUTTON}"`,
    );
    expect(src("app/dashboard/counter/active-card.tsx")).toContain(
      REWARD_READY,
    );
    expect(
      src("features/card-check/components/program-card-status.tsx"),
    ).toContain(REWARD_READY);
    expect(src("features/card-check/components/check-form.tsx")).toContain(
      `"${CHECK_BUTTON}"`,
    );
    expect(src("app/c/page.tsx")).toContain(
      JOIN_NOTE.replace("New here? ", ""),
    );
    expect(src("app/dashboard/counter/use-serve-customer.ts")).toContain(
      "`Reward redeemed for ${res.phone}.`",
    );
  });
});
