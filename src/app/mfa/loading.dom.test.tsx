// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MfaLoading from "./loading";

describe("MfaLoading", () => {
  it("renders a busy status inside the main landmark with pulse placeholders", () => {
    const { container } = render(<MfaLoading />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("Loading");
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
  });
});
