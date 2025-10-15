# TASKS.md

Development Tasks & Roadmap

**Last Updated:** October 2025

This document tracks current development priorities and phase checklists. For architectural patterns and implementation guidance, see [CLAUDE.md](https://claude.ai/chat/CLAUDE.md).

## Current Phase: Phase 0 - Structure Refactoring

**Goal:** Consolidate existing GitHub code into domain-based structure with collocated tests.

**Status:** In Progress

### Prerequisites

- [x] All current tests passing before starting
- [ ] Create backup branch for safety

### Directory Structure

- [ ] Create `src/domains/github/` directory
- [ ] Create placeholder files: `types.ts`, `parser.ts`, `client.ts`, `errors.ts`

### Consolidate Code

- [ ] Move & consolidate `src/github/types/*.ts` → `src/domains/github/types.ts`
    - Combine: `Issue.ts`, `GitHubTarget.ts`, `IssueTarget.ts`, `RepoTarget.ts`
- [ ] Move & consolidate `src/github/parsing/*.ts` → `src/domains/github/parser.ts`
    - Combine: `gitHubUrl.ts`, `utils.ts`, `validation.ts`
- [ ] Move `src/github/client/GitHubClient.ts` → `src/domains/github/client.ts`
- [ ] Move & consolidate `src/github/errors/*.ts` → `src/domains/github/errors.ts`
    - Combine: `GitHubClientError.ts`, `NotFoundError.ts`

### Collocate Tests

- [ ] Move & consolidate `test/github/types/*.test.ts` → `src/domains/github/types.test.ts`
- [ ] Move & consolidate `test/github/parsing/*.test.ts` → `src/domains/github/parser.test.ts`
- [ ] Move `test/github/client/*.test.ts` → `src/domains/github/client.test.ts`
- [ ] Move tests for GitHub errors → `src/domains/github/errors.test.ts`

### Update Imports

- [ ] Update all imports in consolidated files to use relative paths within domain
- [ ] Update `src/ir/transforms.ts` imports to use `@domains/github/types`
- [ ] Update `src/cli/commands/import.ts` imports
- [ ] Update any other files that import from GitHub domain

### Update Configuration

- [ ] Update `tsconfig.json` with new path aliases:
    
    ```json
    {  "baseUrl": "./src",  "paths": {    "@domains/*": ["domains/*"],    "@ir/*": ["ir/*"],    "@core/*": ["core/*"],    "@errors/*": ["errors/*"]  }}
    ```
    
- [ ] Remove old `types` path alias if it exists

### Verify Everything Works

- [ ] Run `pnpm test` - all tests should pass
- [ ] Run `pnpm build` - should compile without errors
- [ ] Run `pnpm cli import <test-github-url>` - CLI should work
- [ ] Run `pnpm check` - no linting errors

### Cleanup

- [ ] Delete old empty directories: `src/github/`, `test/github/`, `test/types/`
- [ ] Review and update any documentation affected by structure change

### Create Barrel Export (Optional but Recommended)

- [ ] Create `src/domains/github/index.ts` with public API exports
- [ ] Test importing from barrel: `import { Issue } from "@domains/github"`

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