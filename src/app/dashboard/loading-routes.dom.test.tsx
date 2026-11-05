// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ActivityLoading from "./activity/loading";
import StatsLoading from "./stats/loading";
import CounterLoading from "./counter/loading";
import PlanLoading from "./plan/loading";
import ProfileLoading from "./profile/loading";
import RedeemVoucherLoading from "./redeem-voucher/loading";
import CustomerDetailLoading from "./customers/[phone]/loading";

const cases = [
  ["activity", ActivityLoading, "Loading activity"],
  ["stats", StatsLoading, "Loading stats"],
  ["counter", CounterLoading, "Loading counter"],
  ["plan", PlanLoading, "Loading plan"],
  ["profile", ProfileLoading, "Loading profile"],
  ["redeem-voucher", RedeemVoucherLoading, "Loading voucher"],
  ["customers/[phone]", CustomerDetailLoading, "Loading customer"],
] as const;

describe.each(cases)("%s loading", (_route, Loading, label) => {
  it("is a busy status region with an accessible label and pulse blocks", () => {
    const { container } = render(<Loading />);

    expect(screen.getByRole("status").getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText(label)).toBeTruthy();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
  });
});
