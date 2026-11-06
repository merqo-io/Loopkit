// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FlameLayers } from "@/components/flame-layers";

describe("FlameLayers markup", () => {
  it.each([0, 1, 2, 3, 4])("renders stage %i unchanged", (stage) => {
    const { container } = render(<FlameLayers stage={stage} className="x" />);
    expect(container.innerHTML).toMatchSnapshot();
  });
});
