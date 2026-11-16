// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const createServerClient = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({ createServerClient }));

import AuthConfirmPage, { metadata } from "./page";

const renderPage = async (query: Record<string, string>) =>
  render(await AuthConfirmPage({ searchParams: Promise.resolve(query) }));

describe("auth confirm page", () => {
  it("renders the continue form for a valid link without calling Supabase", async () => {
    const { container } = await renderPage({
      token_hash: "abc",
      type: "recovery",
    });
    const form = container.querySelector("form");
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("action", "/auth/confirm/verify");
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("renders the invalid state when the link is incomplete", async () => {
    const { container } = await renderPage({ type: "recovery" });
    expect(container.querySelector("form")).toBeNull();
    expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument();
  });

  it("is noindex and sends no referrer", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.referrer).toBe("no-referrer");
  });
});
