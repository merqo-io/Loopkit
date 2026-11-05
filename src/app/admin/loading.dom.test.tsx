// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminOverviewLoading from "./loading";
import AdminActivityLoading from "./activity/loading";
import AdminProgramsLoading from "./programs/loading";
import AdminVendorsLoading from "./vendors/loading";
import AdminProgramDetailLoading from "./programs/[id]/loading";

describe.each([
  ["overview", AdminOverviewLoading, 5],
  ["activity", AdminActivityLoading, 0],
  ["programs", AdminProgramsLoading, 0],
  ["vendors", AdminVendorsLoading, 0],
  ["program detail", AdminProgramDetailLoading, 4],
])("admin %s loading", (_name, Loading, tiles) => {
  it("is busy, announces Loading and shows pulse placeholders", () => {
    const { container } = render(<Loading />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    expect(container.querySelector("[aria-busy='true']")).not.toBeNull();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
    // Stat tiles plus the one list card.
    expect(container.querySelectorAll(".rounded-2xl")).toHaveLength(tiles + 1);
  });
});
