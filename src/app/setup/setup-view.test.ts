import { describe, expect, it } from "vitest";
import { legacySetupPath, resolveNewView } from "@/app/setup/setup-view";

describe("legacySetupPath", () => {
  it.each(["edit", "migrate", "prep", "schedule"])(
    "maps ?%s=<id> to the sub-route",
    (mode) => {
      expect(legacySetupPath({ [mode]: "p1" })).toBe(`/setup/p1/${mode}`);
    },
  );

  it("returns null for the plain list and for ?manage=1", () => {
    expect(legacySetupPath({})).toBeNull();
    expect(legacySetupPath({ manage: "1" })).toBeNull();
  });

  it("keeps the old precedence when several modes are present", () => {
    expect(legacySetupPath({ edit: "a", migrate: "b" })).toBe(
      "/setup/b/migrate",
    );
  });

  it("uses the first value of a repeated param and ignores empty ones", () => {
    expect(legacySetupPath({ edit: ["a", "b"] })).toBe("/setup/a/edit");
    expect(legacySetupPath({ edit: "" })).toBeNull();
  });

  it("encodes ids so they cannot escape the path", () => {
    expect(legacySetupPath({ edit: "a/b?c" })).toBe("/setup/a%2Fb%3Fc/edit");
  });
});

describe("resolveNewView", () => {
  it("shows the create form when the plan allows another program", () => {
    expect(resolveNewView(true)).toBe("create");
  });

  it("shows the upsell at the plan limit", () => {
    expect(resolveNewView(false)).toBe("upsell");
  });
});
