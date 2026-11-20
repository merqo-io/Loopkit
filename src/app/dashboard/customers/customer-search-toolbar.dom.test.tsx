// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../program-switcher", () => ({ ProgramSwitcher: () => null }));

import { CustomerSearchToolbar } from "./customer-search-toolbar";

const programs = [{ id: "p1", name: "Kopi" }];

describe("CustomerSearchToolbar", () => {
  it("prefills the query and keeps the GET form fields", () => {
    const { container } = render(
      <CustomerSearchToolbar
        programs={programs}
        currentId="p1"
        query="9123"
        cohort="lapsed"
      />,
    );
    const input = screen.getByRole("searchbox", { name: "Search by phone" });
    expect((input as HTMLInputElement).value).toBe("9123");
    expect(input.getAttribute("name")).toBe("q");
    const form = container.querySelector("form")!;
    expect(form.getAttribute("action")).toBe("/dashboard/customers");
    expect(form.querySelector('input[name="p"]')).toHaveProperty("value", "p1");
    expect(form.querySelector('input[name="cohort"]')).toHaveProperty(
      "value",
      "lapsed",
    );
  });

  it("clears the query with a tap on the clear button", async () => {
    const user = userEvent.setup();
    render(
      <CustomerSearchToolbar programs={programs} currentId="p1" query="9123" />,
    );
    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", { name: "Clear search" }),
    });
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe("");
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("offers no clear button when there is no query", () => {
    render(<CustomerSearchToolbar programs={programs} currentId="p1" />);
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });
});
