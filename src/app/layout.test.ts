import { describe, it, expect, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Fraunces: () => ({ variable: "--font-fraunces" }),
  Plus_Jakarta_Sans: () => ({ variable: "--font-jakarta" }),
  IBM_Plex_Mono: () => ({ variable: "--font-plex-mono" }),
}));

const { metadata } = await import("./layout");

describe("root layout metadata", () => {
  it("sets the browser-tab title", () => {
    expect(metadata.title).toEqual({
      default: "loopkit | Loyalty cards",
      template: "loopkit | %s",
    });
  });
});
