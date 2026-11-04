// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/page-header";

describe("PageHeader", () => {
  it("renders the eyebrow, one h1, the muted line and the action", () => {
    render(
      <PageHeader
        eyebrow="Today"
        title="Good morning"
        action={<button>Go</button>}
      >
        Mon, 4 Nov
      </PageHeader>,
    );
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "Good morning" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mon, 4 Nov")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
  });

  it("omits the muted line when there are no children and passes through attributes", () => {
    const { container } = render(
      <PageHeader eyebrow="History" title="Activity" data-tour="x" />,
    );
    expect(container.querySelector("h1 + div")).toBeNull();
    expect(container.querySelector("header")).toHaveAttribute("data-tour", "x");
  });
});
