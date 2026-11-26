import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CHECK_BUTTON,
  JOIN_NOTE,
  REDEEM_BUTTON,
  REWARD_READY,
  REWARD_REDEEMED,
  STAMP_BUTTON,
} from "./card-labels";

const src = (p: string) => readFileSync(join(process.cwd(), "src", p), "utf8");

// The landing mock-ups quote the product's own strings; if the app changes
// one, this fails so the landing is updated with it.
describe("landing labels match the app source", () => {
  it("quotes the counter and customer-card strings", () => {
    expect(src("app/dashboard/counter/new-customer-panel.tsx")).toContain(
      `"${STAMP_BUTTON}"`,
    );
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
    expect(src("app/dashboard/redeem-button.tsx")).toContain(
      `${REWARD_REDEEMED} for`,
    );
  });
});
