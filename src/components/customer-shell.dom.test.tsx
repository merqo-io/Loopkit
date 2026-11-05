// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CustomerShell } from "./customer-shell";

describe("CustomerShell", () => {
  it("renders the wordmark, eyebrow, h1, description and children", () => {
    render(
      <CustomerShell
        eyebrow="Loyalty card"
        title="Kaya Toast Co."
        description="Join: Stamps"
      >
        <p>body</p>
      </CustomerShell>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("LoopKit");
    expect(screen.getByText("Loyalty card")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Kaya Toast Co." }),
    ).toBeInTheDocument();
    expect(screen.getByText("Join: Stamps")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});
