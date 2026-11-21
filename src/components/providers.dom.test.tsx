// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { useAppLink } from "@merqo/ui";
import { Providers } from "./providers";

vi.mock("next/link", () => ({
  default: ({ children, ...rest }: React.ComponentProps<"a">) => (
    <a data-next-link="true" {...rest}>
      {children}
    </a>
  ),
}));

function Probe() {
  const AppLink = useAppLink();
  return createElement(AppLink ?? "span", { href: "/dashboard" }, "Go");
}

describe("Providers", () => {
  it("supplies next/link to @merqo/ui client exports", () => {
    render(
      <Providers>
        <Probe />
      </Providers>,
    );
    expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute(
      "data-next-link",
      "true",
    );
  });

  it("renders its children", () => {
    render(
      <Providers>
        <p>child</p>
      </Providers>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});
