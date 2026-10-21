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
        <MarketingOptIn id="m" text="Yes, send me offers." />
      </form>,
    );
    const box = screen.getByRole("checkbox", { name: "Yes, send me offers." });
    expect(box).not.toBeChecked();
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("marketing")).toBeNull();
    await user.click(box);
    expect(box).toBeChecked();
    expect(new FormData(form).get("marketing")).toBe("yes");
  });
});
