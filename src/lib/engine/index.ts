import type { EngineEvent, Progress } from "@/lib/engine/types";
import type { ProgramType } from "@/lib/program-config";
import {
  stampStrategy,
  type StampConfig,
  type StampState,
} from "@/lib/engine/stamp";
import {
  luckyStrategy,
  type LuckyConfig,
  type LuckyState,
} from "@/lib/engine/lucky";
import {
  plantStrategy,
  type PlantConfig,
  type PlantState,
} from "@/lib/engine/plant";
import {
  makeChanceStrategy,
  type ChanceConfig,
  type ChanceState,
} from "@/lib/engine/chance";

export type ProgramLike = {
  type: string;
  config: unknown;
  stamps_required: number;
  reward_text: string;
};
export type CardLike = {
  state: unknown;
  stamp_count: number;
  reward_count: number;
};

function hasKeys(o: unknown): o is Record<string, unknown> {
  return typeof o === "object" && o !== null && Object.keys(o).length > 0;
}

export function resolveStampConfig(program: ProgramLike): StampConfig {
  if (hasKeys(program.config)) return program.config as StampConfig;
  return {
    stamps_required: program.stamps_required,
    reward_text: program.reward_text,
  };
}

function resolveStampState(card: CardLike): StampState {
  if (hasKeys(card.state)) {
    const s = card.state as Partial<StampState>;
    return {
      stamp_count: s.stamp_count ?? card.stamp_count,
      reward_count: s.reward_count ?? card.reward_count,
    };
  }
  return { stamp_count: card.stamp_count, reward_count: card.reward_count };
}

function resolveLuckyConfig(program: ProgramLike): LuckyConfig {
  return program.config as LuckyConfig;
}

function resolveLuckyState(card: CardLike): LuckyState {
  if (hasKeys(card.state)) return card.state as LuckyState;
  return { visits_since_win: 0, total_wins: 0 };
}

function resolvePlantConfig(program: ProgramLike): PlantConfig {
  return program.config as PlantConfig;
}

export function resolvePlantState(card: CardLike): PlantState {
  if (hasKeys(card.state)) return card.state as PlantState;
  return plantStrategy.defaults({} as PlantConfig);
}

function resolveChanceConfig(program: ProgramLike): ChanceConfig {
  return program.config as ChanceConfig;
}

function resolveChanceState(
  card: CardLike,
  variant: "wheel" | "scratch",
): ChanceState {
  if (hasKeys(card.state)) return card.state as ChanceState;
  return makeChanceStrategy(variant).defaults({} as ChanceConfig);
}

type VisitResult = { state: unknown; rewardUnlocked: boolean };

type MechanicStrategy = {
  applyVisit(
    program: ProgramLike,
    card: CardLike,
    event: EngineEvent,
    now: Date,
  ): VisitResult;
  getProgress(program: ProgramLike, card: CardLike, now: Date): Progress;
};

function chanceMechanic(variant: "wheel" | "scratch"): MechanicStrategy {
  const strategy = makeChanceStrategy(variant);
  return {
    applyVisit: (program, card, event, now) =>
      strategy.apply(
        event,
        resolveChanceState(card, variant),
        resolveChanceConfig(program),
        now,
      ),
    getProgress: (program, card, now) =>
      strategy.progress(
        resolveChanceState(card, variant),
        resolveChanceConfig(program),
        now,
      ),
  };
}

// Typed over the full ProgramType union so adding a mechanic fails typecheck
// until it is registered here.
const STRATEGIES: Record<ProgramType, MechanicStrategy> = {
  stamp: {
    applyVisit: (program, card, event, now) =>
      stampStrategy.apply(
        event,
        resolveStampState(card),
        resolveStampConfig(program),
        now,
      ),
    getProgress: (program, card, now) =>
      stampStrategy.progress(
        resolveStampState(card),
        resolveStampConfig(program),
        now,
      ),
  },
  lucky: {
    applyVisit: (program, card, event, now) =>
      luckyStrategy.apply(
        event,
        resolveLuckyState(card),
        resolveLuckyConfig(program),
        now,
      ),
    getProgress: (program, card, now) =>
      luckyStrategy.progress(
        resolveLuckyState(card),
        resolveLuckyConfig(program),
        now,
      ),
  },
  plant: {
    applyVisit: (program, card, event, now) =>
      plantStrategy.apply(
        event,
        resolvePlantState(card),
        resolvePlantConfig(program),
        now,
      ),
    getProgress: (program, card, now) =>
      plantStrategy.progress(
        resolvePlantState(card),
        resolvePlantConfig(program),
        now,
      ),
  },
  wheel: chanceMechanic("wheel"),
  scratch: chanceMechanic("scratch"),
};

// Rows with a legacy or unrecognised type keep behaving as stamp cards.
function strategyFor(type: string): MechanicStrategy {
  return Object.hasOwn(STRATEGIES, type)
    ? STRATEGIES[type as ProgramType]
    : STRATEGIES.stamp;
}

export function applyVisit(
  program: ProgramLike,
  card: CardLike,
  event: EngineEvent,
  now: Date,
): VisitResult {
  return strategyFor(program.type).applyVisit(program, card, event, now);
}

export function getProgress(
  program: ProgramLike,
  card: CardLike,
  now: Date,
): Progress {
  return strategyFor(program.type).getProgress(program, card, now);
}
