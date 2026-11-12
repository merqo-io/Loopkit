// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GlobalError from "./global-error";

describe("GlobalError", () => {
  it("renders its own html and body with the full copy", () => {
    const html = renderToStaticMarkup(
      <GlobalError error={new Error("boom")} reset={vi.fn()} />,
    );

    expect(html).toMatch(/^<html lang="en">.*<body/);
    expect(html).toContain("<main");
    expect(html).toContain("<h1");
    expect(html).toContain("That did not load");
    expect(html).not.toContain("Something went wrong");
    expect(html).toContain(
      "An unexpected error interrupted the page. Try again, and refresh in a moment if it keeps happening.",
    );
    expect(html).toContain("Try again");
  });

  it("calls reset when Try again is touched", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<GlobalError error={new Error("boom")} reset={reset} />);

    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", { name: "Try again" }),
    });
    expect(reset).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });
});
