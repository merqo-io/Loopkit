// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomersTabs } from "./customers-tabs";

describe("CustomersTabs", () => {
  it("links Customers and Referrals and marks the current tab", () => {
    render(<CustomersTabs current="referrals" />);
    expect(screen.getByRole("link", { name: "Customers" })).toHaveAttribute(
      "href",
      "/dashboard/customers",
    );
    const referrals = screen.getByRole("link", { name: "Referrals" });
    expect(referrals).toHaveAttribute("href", "/dashboard/customers/referrals");
    expect(referrals).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Customers" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
