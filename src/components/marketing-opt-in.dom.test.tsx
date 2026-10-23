// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarketingOptIn } from "./marketing-opt-in";

describe("MarketingOptIn", () => {
  it("starts unticked and posts marketing=yes only when ticked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <MarketingOptIn id="m" shopName="Kaya" />
      </form>,
    );
    const box = screen.getByRole("checkbox", {
      name: /^Yes, Kaya may send me offers/,
    });
    expect(box).not.toBeChecked();
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("marketing")).toBeNull();
    expect(new FormData(form).get("marketing_shop")).toBe("Kaya");
    await user.click(box);
    expect(box).toBeChecked();
    expect(new FormData(form).get("marketing")).toBe("yes");
  });

  it("renders and posts the fallback when no shop name is known", () => {
    const { container } = render(
      <form>
        <MarketingOptIn id="m" shopName={null} />
      </form>,
    );
    expect(
      screen.getByRole("checkbox", { name: /^Yes, this shop may/ }),
    ).toBeInTheDocument();
    expect(
      new FormData(container.querySelector("form")!).get("marketing_shop"),
    ).toBe("");
  });
});
