// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Benefits } from "./benefits";
import { HowItWorks } from "./how-it-works";

describe("Benefits", () => {
  it("is a plain list with no icons and no three-column grid", () => {
    const { container } = render(<Benefits />);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector(".sm\\:grid-cols-3")).toBeNull();
    expect(screen.getAllByRole("term")).toHaveLength(3);
  });

  it("states the no-app claim plainly instead of a slogan", () => {
    render(<Benefits />);
    expect(screen.queryByText("Zero friction")).toBeNull();
    expect(screen.getByText("Customers need no app or card")).toBeVisible();
  });
});

describe("HowItWorks", () => {
  it("is a numbered sequence without icon cards or a three-column grid", () => {
    const { container } = render(<HowItWorks />);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector(".sm\\:grid-cols-3")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
