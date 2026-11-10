import { describe, expect, it } from "vitest";
import { containsPattern, escapeLike } from "./ilike";

describe("escapeLike", () => {
  it("escapes percent, underscore and backslash", () => {
    expect(escapeLike("%")).toBe("\\%");
    expect(escapeLike("_")).toBe("\\_");
    expect(escapeLike("\\")).toBe("\\\\");
  });

  it("escapes the backslash before the wildcards so escapes are not doubled", () => {
    expect(escapeLike("\\%")).toBe("\\\\\\%");
    expect(escapeLike("a_b%c\\d")).toBe("a\\_b\\%c\\\\d");
  });

  it("leaves plain text alone", () => {
    expect(escapeLike("+6591234567")).toBe("+6591234567");
  });
});

describe("containsPattern", () => {
  it("wraps the escaped term in wildcards", () => {
    expect(containsPattern("50%")).toBe("%50\\%%");
  });
});
