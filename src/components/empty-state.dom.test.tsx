// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/empty-state";

describe("EmptyState", () => {
  it("renders the headline, sentence and actions", () => {
    render(
      <EmptyState
        title="No customers yet."
        actions={<a href="/x">Open the Counter</a>}
      >
        Share your join code to start enrolling.
      </EmptyState>,
    );
    expect(
      screen.getByRole("heading", { name: "No customers yet." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Share your join code to start enrolling."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open the Counter" }),
    ).toBeInTheDocument();
  });

  it("renders only the headline when nothing else is given", () => {
    const { container } = render(<EmptyState title="No activity yet." />);
    expect(container.querySelector("p")).toBeNull();
    expect(container.querySelectorAll("a, button")).toHaveLength(0);
  });
});
