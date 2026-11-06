// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Program } from "@/lib/program";

const { listProgramsMock, isProMock } = vi.hoisted(() => ({
  listProgramsMock: vi.fn(),
  isProMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/features/auth", () => ({
  requireVendor: vi.fn(async () => ({ user: { id: "v1", email: "v@x.com" } })),
}));
vi.mock("@/lib/program", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/program")>();
  return {
    ...actual,
    listPrograms: listProgramsMock,
    isPro: isProMock,
    applyDueCutovers: vi.fn(async () => {}),
  };
});
vi.mock("@/lib/vendor", () => ({
  getVendorProfile: vi.fn(async () => ({ name: "Test Stall" })),
}));
vi.mock("@/app/setup/actions", () => ({
  activateProgramAction: vi.fn(),
}));
vi.mock("@/lib/cards", () => ({
  programCardCount: vi.fn(async () => 0),
}));
function formMode({
  isEdit,
  prepping,
  replacingId,
}: {
  isEdit: boolean;
  prepping?: boolean;
  replacingId: string | null;
}) {
  if (isEdit) return "edit-mode";
  if (prepping) return "prep-mode";
  return replacingId ? "migrate-mode" : "create-mode";
}

vi.mock("@/app/setup/setup-form", () => ({
  SetupForm: ({
    isEdit,
    prepping,
    replacingId,
  }: {
    isEdit: boolean;
    prepping?: boolean;
    replacingId: string | null;
  }) => (
    <div data-testid="setup-form">
      {formMode({ isEdit, prepping, replacingId })}
    </div>
  ),
}));
vi.mock("@/app/setup/schedule-retirement-form", () => ({
  ScheduleRetirementForm: ({ program }: { program: { name: string } }) => (
    <div data-testid="schedule-form">{program.name}</div>
  ),
}));

import SetupPage from "./page";
import NewProgramPage from "./new/page";
import EditProgramPage from "./[programId]/edit/page";
import MigrateProgramPage from "./[programId]/migrate/page";
import PrepProgramPage from "./[programId]/prep/page";
import ScheduleProgramPage from "./[programId]/schedule/page";

function program(overrides: Partial<Program>): Program {
  return {
    id: "p1",
    name: "Coffee Stamps",
    stamps_required: 8,
    reward_text: "a free coffee",
    type: "stamp",
    config: {},
    active: true,
    expiry_days: null,
    head_start: false,
    head_start_percent: 20,
    replaced_by: null,
    carry_over_stamps: false,
    birthday_bonus_enabled: false,
    ...overrides,
  };
}

const idParams = (programId: string) => ({
  params: Promise.resolve({ programId }),
});

describe("/setup (programs list)", () => {
  it("shows only the programs list, with a + New program link to /setup/new", async () => {
    listProgramsMock.mockResolvedValue([program({})]);
    isProMock.mockResolvedValue(true);

    render(await SetupPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Programs" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Coffee Stamps")).toBeInTheDocument();
    expect(screen.queryByTestId("setup-form")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /\+ new program/i }),
    ).toHaveAttribute("href", "/setup/new");
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/setup/p1/edit",
    );
    expect(screen.getByRole("link", { name: "Change type" })).toHaveAttribute(
      "href",
      "/setup/p1/migrate",
    );
  });

  it("links Prep replacement for a free vendor and Schedule retirement for a Pro vendor with two active programs", async () => {
    listProgramsMock.mockResolvedValue([program({})]);
    isProMock.mockResolvedValue(false);
    const { unmount } = render(
      await SetupPage({ searchParams: Promise.resolve({}) }),
    );
    expect(
      screen.getByRole("link", { name: "Prep replacement" }),
    ).toHaveAttribute("href", "/setup/p1/prep");
    unmount();

    listProgramsMock.mockResolvedValue([
      program({}),
      program({ id: "p2", name: "Bakery Stamps" }),
    ]);
    isProMock.mockResolvedValue(true);
    render(await SetupPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getAllByRole("link", { name: "Schedule retirement" })[0],
    ).toHaveAttribute("href", "/setup/p1/schedule");
  });

  it("sends a vendor with no programs to /setup/new", async () => {
    listProgramsMock.mockResolvedValue([]);
    isProMock.mockResolvedValue(false);

    await expect(
      SetupPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("REDIRECT:/setup/new");
  });

  it.each([
    ["edit", "/setup/p1/edit"],
    ["migrate", "/setup/p1/migrate"],
    ["prep", "/setup/p1/prep"],
    ["schedule", "/setup/p1/schedule"],
  ])("redirects the old ?%s=p1 URL to %s", async (mode, target) => {
    await expect(
      SetupPage({ searchParams: Promise.resolve({ [mode]: "p1" }) }),
    ).rejects.toThrow(`REDIRECT:${target}`);
  });

  it("still shows the list for the old ?manage=1 URL", async () => {
    listProgramsMock.mockResolvedValue([program({})]);
    isProMock.mockResolvedValue(true);

    render(await SetupPage({ searchParams: Promise.resolve({ manage: "1" }) }));

    expect(screen.getByText("Your programs")).toBeInTheDocument();
  });
});

describe("/setup/new", () => {
  it("shows the create form and a Manage-programs link for a Pro vendor with an existing program", async () => {
    listProgramsMock.mockResolvedValue([program({})]);
    isProMock.mockResolvedValue(true);

    render(await NewProgramPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Create a program" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("setup-form")).toHaveTextContent("create-mode");
    expect(
      screen.getByRole("link", { name: /manage your programs/i }),
    ).toHaveAttribute("href", "/setup");
  });

  it("shows the upsell card (not the create form) for a free-tier vendor at their cap", async () => {
    listProgramsMock.mockResolvedValue([program({})]);
    isProMock.mockResolvedValue(false);

    render(await NewProgramPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Add a program" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("setup-form")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /manage your programs/i }),
    ).toHaveAttribute("href", "/setup");
  });

  it("shows only the create form (no Manage link) for a first-run vendor", async () => {
    listProgramsMock.mockResolvedValue([]);
    isProMock.mockResolvedValue(false);

    render(await NewProgramPage());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Set up your loyalty card",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("setup-form")).toHaveTextContent("create-mode");
    expect(
      screen.queryByRole("link", { name: /manage your programs/i }),
    ).not.toBeInTheDocument();
  });
});

describe("/setup/[programId]/*", () => {
  it("edit: shows only the edit form", async () => {
    listProgramsMock.mockResolvedValue([program({})]);
    isProMock.mockResolvedValue(true);

    render(await EditProgramPage(idParams("p1")));

    expect(
      screen.getByRole("heading", { level: 1, name: "Edit your card" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("setup-form")).toHaveTextContent("edit-mode");
    expect(screen.queryByText("Your programs")).not.toBeInTheDocument();
  });

  it("prep: shows only the replacement form, named after the program", async () => {
    listProgramsMock.mockResolvedValue([program({})]);
    isProMock.mockResolvedValue(false);

    render(await PrepProgramPage(idParams("p1")));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Set up Coffee Stamps's replacement",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("setup-form")).toHaveTextContent("prep-mode");
  });

  it("schedule: shows the schedule form for a Pro vendor", async () => {
    listProgramsMock.mockResolvedValue([
      program({ id: "p1", name: "Coffee Stamps" }),
      program({ id: "p2", name: "Bakery Stamps" }),
    ]);
    isProMock.mockResolvedValue(true);

    render(await ScheduleProgramPage(idParams("p1")));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Schedule Coffee Stamps's retirement",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("schedule-form")).toHaveTextContent(
      "Coffee Stamps",
    );
    expect(screen.queryByTestId("setup-form")).not.toBeInTheDocument();
  });

  it("migrate: shows the new-type form replacing the program", async () => {
    listProgramsMock.mockResolvedValue([program({})]);
    isProMock.mockResolvedValue(true);

    render(await MigrateProgramPage(idParams("p1")));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Change Coffee Stamps's type",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("setup-form")).toHaveTextContent("migrate-mode");
  });

  it.each([
    ["edit", EditProgramPage],
    ["migrate", MigrateProgramPage],
    ["prep", PrepProgramPage],
    ["schedule", ScheduleProgramPage],
  ])("%s: 404s for an id that is not the vendor's program", async (_, Page) => {
    listProgramsMock.mockResolvedValue([program({})]);
    isProMock.mockResolvedValue(true);

    await expect(Page(idParams("someone-elses"))).rejects.toThrow("NOT_FOUND");
  });
});
