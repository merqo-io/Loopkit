import { describe, expect, it } from "vitest";
import {
  applyVisit,
  getProgress,
  type CardLike,
  type ProgramLike,
} from "./index";

const now = new Date("2026-10-09T00:00:00Z");
const visit = { kind: "visit" as const };

const stampProgram: ProgramLike = {
  type: "stamp",
  stamps_required: 5,
  reward_text: "Free drink",
  config: {},
};
const luckyProgram: ProgramLike = {
  type: "lucky",
  stamps_required: 10,
  reward_text: "Prize",
  config: {
    win_probability: 0.5,
    pity_ceiling: 4,
    cooldown_visits: 0,
    reward_text: "Prize",
  },
};
const plantProgram: ProgramLike = {
  type: "plant",
  stamps_required: 10,
  reward_text: "Bloom",
  config: {
    stages: [
      { name: "Seed", threshold: 0 },
      { name: "Sprout", threshold: 1 },
      { name: "Bloom", threshold: 2 },
    ],
    growth_per_visit: 1,
    grace_days: 7,
    decay_rate: 0.5,
    floor_growth: 0,
    reward_text: "Bloom",
  },
};
function chanceProgram(type: "wheel" | "scratch"): ProgramLike {
  return {
    type,
    stamps_required: 10,
    reward_text: "Default reward",
    config: {
      variant: type,
      cooldown_visits: 0,
      reward_text: "Default reward",
      segments: [
        { id: "miss", label: "Try again", weight: 1 },
        { id: "win", label: "Free coffee", weight: 1, reward_text: "Coffee" },
      ],
    },
  };
}
const fresh: CardLike = { state: {}, stamp_count: 0, reward_count: 0 };

describe("dispatch across every mechanic", () => {
  it("stamp: falls back to the flat columns and counts a visit", () => {
    const card: CardLike = { state: {}, stamp_count: 2, reward_count: 1 };
    const result = applyVisit(stampProgram, card, visit, now);
    expect(result.state).toMatchObject({ stamp_count: 3, reward_count: 1 });
    expect(result.rewardUnlocked).toBe(false);
    expect(getProgress(stampProgram, card, now).view).toMatchObject({
      kind: "dots",
      filled: 2,
      total: 5,
    });
  });

  it("stamp: unlocks the reward on the final stamp", () => {
    const card: CardLike = { state: {}, stamp_count: 4, reward_count: 0 };
    expect(applyVisit(stampProgram, card, visit, now).rewardUnlocked).toBe(
      true,
    );
  });

  it("unknown types behave as stamp", () => {
    const card: CardLike = { state: {}, stamp_count: 1, reward_count: 0 };
    const unknown = { ...stampProgram, type: "mystery" };
    expect(applyVisit(unknown, card, visit, now)).toEqual(
      applyVisit(stampProgram, card, visit, now),
    );
    expect(getProgress(unknown, card, now)).toEqual(
      getProgress(stampProgram, card, now),
    );
  });

  it("lucky: starts fresh and pays out at the pity ceiling", () => {
    expect(getProgress(luckyProgram, fresh, now).view).toEqual({
      kind: "lucky",
      visitsSinceWin: 0,
      pityCeiling: 4,
    });
    const nearPity: CardLike = {
      state: { visits_since_win: 3, total_wins: 2 },
      stamp_count: 0,
      reward_count: 0,
    };
    expect(
      applyVisit(
        luckyProgram,
        nearPity,
        { kind: "visit", payload: { roll: 0.99 } },
        now,
      ),
    ).toEqual({
      state: { visits_since_win: 0, total_wins: 3 },
      rewardUnlocked: true,
    });
  });

  it("plant: starts from fresh growth and advances on a visit", () => {
    expect(getProgress(plantProgram, fresh, now).stage).toBe("Seed");
    const result = applyVisit(plantProgram, fresh, visit, now);
    expect(result.state).toMatchObject({
      growth: 1,
      last_visit_at: now.toISOString(),
    });
    const next = getProgress(
      plantProgram,
      { state: result.state, stamp_count: 0, reward_count: 0 },
      now,
    );
    expect(next.view).toMatchObject({ kind: "plant", totalStages: 3 });
    expect(next.stage).toBe("Sprout");
  });

  it.each(["wheel", "scratch"] as const)(
    "%s: progress and visit use the chance variant",
    (type) => {
      const p = chanceProgram(type);
      expect(getProgress(p, fresh, now).view).toMatchObject({
        kind: "chance",
        variant: type,
      });
      const result = applyVisit(
        p,
        fresh,
        { kind: "visit", payload: { roll: 0.99 } },
        now,
      );
      expect(result.state).toBeDefined();
      expect(typeof result.rewardUnlocked).toBe("boolean");
    },
  );
});
