import { describe, it, expect } from "vitest";
import {
  weakPasswordMessage,
  weakPasswordErrorMessage,
  PASSWORD_REQUIREMENTS_HINT,
} from "./weak-password";

const CHARS_MSG =
  "Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789, !@#$%^&*()_+-=.";

describe("weakPasswordMessage", () => {
  it("names the minimum length when the message carries a number", () => {
    expect(
      weakPasswordMessage({
        reasons: ["length"],
        message: "Password should be at least 8 characters.",
      }),
    ).toBe("Password is too short. Use at least 8 characters.");
  });

  it("falls back when the length has no number", () => {
    expect(weakPasswordMessage({ reasons: ["length"], message: "" })).toBe(
      "Password is too short. Use a longer one.",
    );
  });

  it("names parsed character classes including a symbol", () => {
    expect(
      weakPasswordMessage({ reasons: ["characters"], message: CHARS_MSG }),
    ).toBe(
      "Password must include a lowercase letter, an uppercase letter, a number and a symbol.",
    );
  });

  it("omits the symbol when no symbol set is listed", () => {
    expect(
      weakPasswordMessage({
        reasons: ["characters"],
        message:
          "Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789.",
      }),
    ).toBe(
      "Password must include a lowercase letter, an uppercase letter and a number.",
    );
  });

  it("uses a generic mix message when characters are unparseable", () => {
    expect(weakPasswordMessage({ reasons: ["characters"], message: "" })).toBe(
      "Password needs a wider mix of characters, such as upper and lower case letters, numbers and symbols.",
    );
  });

  it("explains a pwned password", () => {
    expect(weakPasswordMessage({ reasons: ["pwned"], message: "" })).toBe(
      "This password has appeared in a data breach. Choose a different one.",
    );
  });

  it("joins several reasons with a space", () => {
    expect(
      weakPasswordMessage({
        reasons: ["length", "pwned"],
        message: "Password should be at least 8 characters.",
      }),
    ).toBe(
      "Password is too short. Use at least 8 characters. This password has appeared in a data breach. Choose a different one.",
    );
  });

  it("infers from the message when reasons are missing", () => {
    expect(
      weakPasswordMessage({
        reasons: [],
        message: "Password should be at least 6 characters.",
      }),
    ).toBe("Password is too short. Use at least 6 characters.");
    expect(
      weakPasswordMessage({ reasons: null, message: CHARS_MSG }),
    ).toContain("must include");
  });

  it("uses the generic copy when nothing is recognisable", () => {
    expect(weakPasswordMessage({ reasons: [], message: "nope" })).toBe(
      "That password is too weak. Choose a longer, less common one.",
    );
  });
});

describe("weakPasswordErrorMessage", () => {
  it("returns the message for weak_password errors", () => {
    expect(
      weakPasswordErrorMessage({
        code: "weak_password",
        reasons: ["pwned"],
        message: "x",
      }),
    ).toContain("data breach");
  });

  it("returns null for other errors", () => {
    expect(
      weakPasswordErrorMessage({ code: "user_already_exists" }),
    ).toBeNull();
    expect(
      weakPasswordErrorMessage({ message: "Email already registered" }),
    ).toBeNull();
    expect(weakPasswordErrorMessage(null)).toBeNull();
  });
});

describe("PASSWORD_REQUIREMENTS_HINT", () => {
  it("states the production policy", () => {
    expect(PASSWORD_REQUIREMENTS_HINT).toBe(
      "Use at least 8 characters, with a lowercase letter, an uppercase letter, a number and a symbol.",
    );
  });
});
