// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RouteError from "./error";

describe("RouteError", () => {
  it("renders the full copy and logs the error", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const error = new Error("boom");
    render(<RouteError error={error} reset={vi.fn()} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "That did not load" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This is usually a flaky connection. Try again in a moment.",
      ),
    ).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith("Unhandled error", error);
    consoleError.mockRestore();
  });

  it("shows Next's digest as a reference line", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const error = Object.assign(new Error("boom"), { digest: "abc123" });
    render(<RouteError error={error} reset={vi.fn()} />);

    expect(screen.getByText("Reference: abc123")).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it("calls reset when Try again is touched", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<RouteError error={new Error("boom")} reset={reset} />);

    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", { name: "Try again" }),
    });
    expect(reset).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });
});
