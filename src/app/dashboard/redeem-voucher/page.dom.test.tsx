// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { getVoucherMock } = vi.hoisted(() => ({ getVoucherMock: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("redirect");
  }),
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/features/auth", () => ({ requireVendor: vi.fn(async () => ({})) }));
vi.mock("@/lib/program", () => ({ getVoucherByToken: getVoucherMock }));
vi.mock("./redeem-voucher-confirm", () => ({
  RedeemVoucherConfirm: () => <div>confirm</div>,
}));
vi.mock("@/app/dashboard/redeem-voucher/redeem-voucher-confirm", () => ({
  RedeemVoucherConfirm: () => <div>confirm</div>,
}));

import RedeemVoucherPage, { metadata } from "./page";

describe("RedeemVoucherPage", () => {
  it("has a page title and an h1", async () => {
    getVoucherMock.mockResolvedValue(null);
    render(
      await RedeemVoucherPage({
        searchParams: Promise.resolve({ token: "t" }),
      }),
    );
    expect(metadata.title).toBe("Redeem voucher");
    expect(
      screen.getByRole("heading", { level: 1, name: "Redeem voucher" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("That code is not for this shop."),
    ).toBeInTheDocument();
  });
});
