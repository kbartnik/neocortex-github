# Repository Guidelines

## Project Structure & Module Organization
TypeScript sources live in `src/`. `src/index.ts` wires together shared utilities in `src/logger.ts`, `src/url-parser.ts`, and submodules under `src/utls/`. Unit tests sit beside their targets as `*.test.ts` (for example `src/logger.test.ts`). Configuration roots are in the repo top level: `tsconfig.json` for compilation, `vitest.config.ts` for testing, and `biome.json` for linting/formatting. Build outputs land in `dist/` and are ignored by default.

## Build, Test, and Development Commands
Install dependencies with `pnpm install`. Use `pnpm dev` for a hot-reloading TypeScript watcher via `tsx`. Produce production-ready JavaScript with `pnpm build` (runs `tsc`). Run the unit suite using `pnpm test`; add `:watch`, `:ui`, or `:coverage` variants depending on the workflow. `pnpm start` executes the compiled bundle from `dist/`. Clear build artifacts with `pnpm clean` before fresh compiles when needed.

## Coding Style & Naming Conventions
Biome enforces two-space indentation, trailing newline, and organized imports on save. Prefer `camelCase` for variables/functions, `PascalCase` for classes and TypeScript types, and kebab-case for filenames (mirroring existing modules). Keep exports focused—group public helpers in `src/index.ts` and keep internal helpers inside their feature folder. Run `pnpm check` before commits; apply autofixes with `pnpm check:fix` or `pnpm format` when the linter reports issues.

## Testing Guidelines
Write Vitest unit tests next to the implementation using the `*.test.ts` suffix. Organize suites with `describe` blocks mirroring module names and use descriptive assertions for edge cases (see `src/url-parser.test.ts`). Target high coverage for critical parsing and logging paths; verify locally with `pnpm test:coverage`. Snapshot tests are acceptable, but include explanatory comments when locking complex structures.

## Commit & Pull Request Guidelines
Commits use Conventional Commit prefixes (`feat`, `test`, `fix`, etc.) and imperative, present-tense subjects (e.g., `feat(url-parser): add validation for complete GitHub repository paths`). Squash trivial fixups before opening a PR. PR descriptions should summarize scope, link any tracking issues, list manual/automated test results, and attach screenshots or logs when behavior changes are user-facing.
