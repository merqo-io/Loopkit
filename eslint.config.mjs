import next from "eslint-config-next";
import sonarjs from "eslint-plugin-sonarjs";
import { merqoEslintPreset } from "@merqo/ui/eslint";

const tsPlugin = next.find((c) => c.plugins?.["@typescript-eslint"]).plugins[
  "@typescript-eslint"
];

const eslintConfig = [
  ...next,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "sonarjs/no-unused-vars": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "supabase/**",
      "coverage/**",
      ".stryker-tmp/**",
      "reports/**",
      "test-results/**",
      "playwright-report/**",
      "scripts/demo/out/**",
      ".claude/worktrees/**",
      ".codex/**",
    ],
  },
  // sonarjs's own recommended config carries its plugin registration; every
  // other block below reuses that same registration via bare `rules` keys
  // instead of re-declaring `plugins: { sonarjs }` with a second import
  // reference — two different plugin object identities under the same name
  // throws "Cannot redefine plugin sonarjs" in flat config.
  sonarjs.configs.recommended,
  ...merqoEslintPreset({
    sonarjsPlugin: sonarjs.configs.recommended.plugins.sonarjs,
    tsPlugin,
  }),
  {
    // Every use of Math.random() in this codebase is either cosmetic
    // (confetti/scratch-card jitter, animation timing) or a loyalty-program
    // "chance" roll authorized server-side by the RLS `owns_program` check
    // (loopkit.record_visit) — the vendor who submits it already has full
    // authority over their own program's rewards, so an unpredictable RNG
    // isn't a security requirement here. Audited every call site; none are
    // tokens/session-ids/crypto material.
    rules: {
      "sonarjs/pseudo-random": "off",
    },
  },
  {
    // Generated shadcn/ui primitives (CLI-managed, not hand-edited) — the
    // recommended set's complexity/duplication rules fire on vendored
    // component boilerplate that this project doesn't own or refactor.
    files: ["src/components/ui/**"],
    rules: {
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/cognitive-complexity": "off",
    },
  },
  {
    // Pre-existing complexity hotspots (95 and 67 vs. the 15 threshold, with
    // a matching pile of nested view-kind ternaries) — the two largest files
    // in the codebase. Decomposing them safely needs a dedicated, tested
    // refactor pass, not a rushed rewrite as a side effect of a lint-rule
    // rollout. Tracked as follow-up debt, not silently ignored — see the
    // code-debt sweep notes for this repo.
    files: ["src/app/setup/page.tsx", "src/app/setup/setup-form.tsx"],
    rules: {
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/no-nested-conditional": "off",
    },
  },
  {
    // Table-driven fixtures repeat literal strings and mock structure.
    files: ["**/*.test.{ts,tsx}", "**/test/**", "scripts/**", "e2e/**"],
    rules: {
      "sonarjs/no-commented-code": "off",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-identical-functions": "off",
    },
  },
  {
    // Over the size and complexity limits until Task K5 (split long files) shrinks them.
    files: [
      "src/app/dashboard/actions.ts",
      "src/components/flame-layers.tsx",
      "src/components/scratch-card.tsx",
      "src/features/card-check/api/actions.ts",
      "src/lib/stats.ts",
      "src/lib/types.ts",
    ],
    rules: {
      "max-lines": "off",
      complexity: "off",
      "max-lines-per-function": "off",
    },
  },
  {
    // Over the complexity or function-length limit; split with their pages and hooks later.
    files: [
      "src/app/dashboard/counter/use-serve-customer.ts",
      "src/app/setup/actions.ts",
      "src/app/setup/page.tsx",
      "src/app/setup/preview-animation.ts",
      "src/app/setup/preview-card.tsx",
      "src/app/setup/setup-form.tsx",
      "src/app/setup/setup-rules-fields.tsx",
      "src/app/setup/use-setup-form-state.ts",
      "src/features/card-check/components/check-form.tsx",
      "src/features/card-check/components/program-card-status.tsx",
      "src/lib/activity.ts",
    ],
    rules: { complexity: "off", "max-lines-per-function": "off" },
  },
  {
    // Named token modules are where colour literals live.
    files: ["src/lib/tokens/**"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    // Harness enforcement scripts: hash-tracked by .claude/harness.json and
    // gated behind human approval to edit (protect-files.sh) — not this
    // rollout's to rewrite.
    files: [".claude/hooks/**", ".claude/.harness-base/**"],
    rules: {
      "sonarjs/concise-regex": "off",
    },
  },
];

export default eslintConfig;
