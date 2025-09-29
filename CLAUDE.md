# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `pnpm install`
- **Development with hot reload**: `pnpm dev` (uses tsx to watch TypeScript files)
- **Build**: `pnpm build` (compiles TypeScript to `dist/`)
- **Run compiled code**: `pnpm start`
- **Clean build artifacts**: `pnpm clean`

## Testing Commands

- **Run tests**: `pnpm test`
- **Watch mode**: `pnpm test:watch`
- **UI interface**: `pnpm test:ui`
- **Coverage report**: `pnpm test:coverage`

## Code Quality

- **Check code (lint + format)**: `pnpm check`
- **Auto-fix issues**: `pnpm check:fix`
- **Format only**: `pnpm format`

Always run `pnpm check` before committing. Use `pnpm check:fix` to automatically resolve most linting issues.

## Project Architecture

This is a TypeScript library for parsing and building GitHub URLs with strong type safety.

### Core Components

- **`src/gitHubUrl.ts`**: Main module exports `gitHubUrl` object with three methods:
  - `parse(url: string)`: Parses GitHub URLs into typed target objects
  - `build(target: GitHubTarget, baseUrl?)`: Constructs URLs from target objects
  - `buildPath(target: GitHubTarget)`: Generates just the path portion

- **Type System** (`src/types/`):
  - `GitHubTarget`: Union type of `RepoTarget | IssueTarget`
  - `RepoTarget`: Represents repository URLs (`kind: "repo"`, owner, repo)
  - `IssueTarget`: Represents issue URLs (`kind: "issue"`, owner, repo, number)
  - Type guards: `isRepoTarget()`, `isIssueTarget()`

- **Validation** (`src/shared/validation.ts`):
  - `isValidOwnerName()`: GitHub username validation (1-39 chars, alphanumeric + hyphens)
  - `isValidRepoName()`: Repository name validation (1-100 chars, alphanumeric + _.- )
  - `isNonZeroDigitString()`: Positive integer string validation

### Key Design Patterns

- **Discriminated unions**: Target types use `kind` field for type discrimination
- **Builder pattern**: Separate builders for each target type with type safety
- **Validation-first parsing**: URL parsing includes comprehensive validation of GitHub naming rules
- **Path aliases**: TypeScript configuration maps `"types"` to `"src/types/index.ts"`

### Code Style (Biome Configuration)

- 2-space indentation
- Strict TypeScript with no `any` types allowed (`noExplicitAny: "error"`)
- Import/export type separation enforced
- Unused variables/imports treated as errors
- Uses `type` definitions over `interface` (enforced by `useConsistentTypeDefinitions`)

### Test Structure

- Tests use Vitest with global environment
- Test files follow `*.test.ts` naming and sit alongside source files
- Coverage excludes `node_modules/` and `.d.ts` files
- Tests should cover URL parsing edge cases and validation logic extensively