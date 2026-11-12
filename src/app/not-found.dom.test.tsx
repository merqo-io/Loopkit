// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFoundPage from "./not-found";

describe("NotFoundPage", () => {
  it("renders the 404 copy and a link home", () => {
    render(<NotFoundPage />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This page does not exist. Ask the shop for their loyalty link to check your stamps.",
      ),
    ).toBeInTheDocument();
    const home = screen.getByRole("link", { name: "Back to home" });
    expect(home).toHaveAttribute("href", "/");
    expect(home).toHaveClass("rounded-xl");
  });
});
