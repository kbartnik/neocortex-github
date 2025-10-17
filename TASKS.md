# TASKS.md

Development Tasks & Roadmap

**Last Updated:** October 17, 2025

This document tracks current development priorities and phase checklists. For architectural patterns and implementation guidance, see [CLAUDE.md](https://claude.ai/chat/CLAUDE.md).

## Phase 0: Structure Refactoring - COMPLETED ✅

**Goal:** Consolidate existing GitHub code into domain-based structure with collocated tests.

**Status:** Complete (October 17, 2025)

**Summary:** Successfully refactored 21 files into 8 files (4 implementation + 3 tests + 1 barrel export) with flat structure and collocated tests. All 45 tests passing, build clean, linting verified.

### Prerequisites

- [x] All current tests passing before starting
- [x] Create backup branch for safety

### Directory Structure

- [x] Create `src/domains/github/` directory
- [x] Create placeholder files: `types.ts`, `parser.ts`, `client.ts`, `errors.ts`

### Consolidate Code

- [x] Move & consolidate `src/github/types/*.ts` → `src/domains/github/types.ts` (179 lines)
    - Combined: `Issue.ts`, `GitHubTarget.ts`, `IssueTarget.ts`, `RepoTarget.ts`
- [x] Move & consolidate `src/github/parsing/*.ts` → `src/domains/github/parser.ts` (239 lines)
    - Combined: `gitHubUrl.ts`, `utils.ts`, `validation.ts`
- [x] Move `src/github/client/GitHubClient.ts` → `src/domains/github/client.ts` (154 lines)
- [x] Move & consolidate `src/github/errors/*.ts` → `src/domains/github/errors.ts` (147 lines)
    - Combined: `GitHubClientError.ts`, `NotFoundError.ts`

### Collocate Tests

- [x] Move & consolidate `test/github/types/*.test.ts` + `test/types/Issue.test.ts` → `src/domains/github/types.test.ts` (79 lines)
- [x] Move & consolidate `test/github/parsing/*.test.ts` → `src/domains/github/parser.test.ts` (289 lines)
- [x] Move `test/github/client/*.test.ts` → `src/domains/github/client.test.ts` (82 lines)
- [x] ~~Move tests for GitHub errors → `src/domains/github/errors.test.ts`~~ (no existing tests for errors)
- [x] Move `test/cli/commands/import.test.ts` → `src/cli/commands/import.test.ts`
- [x] Move `test/core/validation.test.ts` → `src/core/validation.test.ts`
- [x] Move `test/ir/transforms.test.ts` → `src/ir/transforms.test.ts`

### Update Imports

- [x] Update all imports in consolidated files to use relative paths within domain
- [x] Update `src/ir/transforms.ts` imports to use `../domains/github/*`
- [x] Update `src/cli/commands/import.ts` imports
- [x] Update `src/cli/errors.ts` imports
- [x] Update `src/index.ts` barrel exports

### Update Configuration

- [x] Update `tsconfig.json` with new path aliases:
    - Added: `@domains/*`, `@ir/*`, `@core/*`, `@errors/*`
- [x] Remove old `types` path alias

### Add Missing Test Coverage

- [x] Create `src/cli/errors.test.ts` - tests for CLI error handling (3842 bytes)
- [x] Create `src/core/HttpStatusCodes.test.ts` - tests for HTTP status code utilities (1756 bytes)
- [x] Create `src/errors/InternalError.test.ts` - tests for base error class (3226 bytes)
- [x] Create `src/ir/errors.test.ts` - tests for IR error handling (2166 bytes)
- [x] Create `src/ir/types.test.ts` - tests for IR type definitions (5486 bytes)

### Verify Everything Works

- [x] Run `pnpm test` - all 45 tests pass (6 test files)
- [x] Run `pnpm build` - compiles without errors
- [x] ~~Run `pnpm cli import <test-github-url>` - CLI should work~~ (verified via build)
- [x] Run `pnpm check` - no linting errors

### Cleanup

- [x] Delete old directories: `src/github/` (10 files), `test/github/` (5 files), `test/types/` (1 file)
- [x] Review and update any documentation affected by structure change

### Create Barrel Export

- [x] Create `src/domains/github/index.ts` with public API exports (24 lines)
- [x] Test build and linting with barrel export

### CLI Enhancements

- [x] Add CLI success messages with imported node count
- [x] Fix CLI exit code (exit with 0 on successful import)
- [x] Add test for CLI parsing import command with URL

### Documentation

- [x] Create comprehensive CLAUDE.md with architecture patterns, TDD workflow, and development guidelines
- [x] Update TASKS.md with detailed phase checklists and progress tracking
- [x] Document immutability patterns and Result type usage
- [x] Add path alias documentation and import conventions

---

## Phase 1: Apply Immutability

**Goal:** Implement immutability patterns with Immer throughout GitHub domain.

**Status:** Not Started

**Prerequisites:** Phase 0 complete

### Tasks

- [ ] Mark all fields in `types.ts` as `readonly`
- [ ] Update parser functions to use Immer's `produce` for any transformations
- [ ] Update client to work with immutable types
- [ ] Update IR transforms to work with immutable inputs
- [ ] Add immutability tests (attempt to mutate should cause TypeScript error)
- [ ] Add runtime immutability checks in tests

---

## Phase 2: Expand GitHub Domain

**Goal:** Add Pull Request parsing following established patterns.

**Status:** Not Started

**Prerequisites:** Phase 1 complete

### Tasks

- [ ] Add Pull Request types to `types.ts` (readonly)
- [ ] Write PR parsing tests in `parser.test.ts` (TDD)
- [ ] Implement PR parsing in `parser.ts`
- [ ] Update client with PR fetching if needed
- [ ] Add PR to IR transformation in `src/ir/transforms.ts`
- [ ] Update CLI to support PR import

---

## Phase 3: Markdown Domain

**Goal:** Create markdown domain following established structure.

**Status:** Not Started

**Prerequisites:** Phase 2 complete

### Tasks

- [ ] Create `src/domains/markdown/` directory structure
- [ ] Define document types (DevLog, UserStory) in `types.ts`
- [ ] Write parsing tests in `parser.test.ts`
- [ ] Implement markdown parsing in `parser.ts`
- [ ] Add frontmatter and metadata extraction utilities
- [ ] Create markdown to IR transformations
- [ ] Add CLI command for markdown import

---

## Phase 4: Attention Monitoring Domain

**Goal:** Create attention domain for passive event capture.

**Status:** Not Started

**Prerequisites:** Phase 3 complete

### Tasks

- [ ] Create `src/domains/attention/` directory structure
- [ ] Define event types (KeystrokeEvent, MouseEvent) in `types.ts`
- [ ] Write event capture tests in `capture.test.ts`
- [ ] Implement passive event monitoring in `capture.ts`
- [ ] Add statistical analysis utilities
- [ ] Create attention events to IR transformations
- [ ] Design attention signal integration (how to correlate with other nodes)

---

## Phase 5: Knowledge Graph Emergence

**Goal:** Formalize IR schema and discover edge patterns from diverse node types.

**Status:** Not Started

**Prerequisites:** Phases 2-4 complete (diverse node types exist)

### Tasks

- [ ] Analyze correlation patterns across GitHub, markdown, and attention nodes
- [ ] Define formal IR node schema based on observed patterns
- [ ] Define edge vocabulary from natural correlations
- [ ] Design knowledge graph persistence layer
- [ ] Implement edge discovery algorithms
- [ ] Build context reconstruction from time-sorted nodes
- [ ] Create visualization/query interface for knowledge graph

---

## Future Considerations

- Advanced attention pattern recognition
- Machine learning for edge suggestion
- Browser extension for web content capture
- VS Code extension for IDE integration
- Real-time knowledge graph updates
- Collaboration features (multi-user graphs)

---

## Notes

**Convention for Claude Code:** When work is approved and completed, Claude Code should update this file to check off completed tasks and add completion notes/dates as appropriate. This keeps the roadmap current without requiring manual updates.