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

## Phase 1: Immutability with Build-Time Code Generation

**Goal:** Implement immutability patterns and build TypeScript transformer infrastructure for automatic fluent builder generation.

**Status:** In Progress (Branch: `ts-transformer-builder`)

**Prerequisites:** Phase 0 complete

**Scope Expansion Note:** This phase evolved from simple immutability application to include sophisticated build-time code generation. The educational value of building TypeScript transformers and the long-term benefits of automated builder generation justify the expanded scope.

### Phase 1A: Foundation - Manual Immutability

**Educational Focus:** Understanding immutability patterns and Immer integration.

**Goal:** Establish immutable types and basic patterns before building generation infrastructure.

**Status:** Not Started

#### Tasks

- [ ] Mark all fields in GitHub domain `types.ts` as `readonly`
- [ ] Add TypeScript immutability tests (compile-time errors for mutation attempts)
- [ ] Add runtime immutability validation tests
- [ ] Update parser functions to use Immer's `produce` for transformations
- [ ] Update client to work with immutable types
- [ ] Update IR transforms to work with immutable inputs
- [ ] Verify all existing tests pass with immutable types

#### Success Criteria

- All GitHub domain types use `readonly` modifiers
- Tests verify both compile-time and runtime immutability
- Immer patterns established for data transformations
- No breaking changes to existing functionality

### Phase 1B: Transformer Infrastructure

**Educational Focus:** TypeScript compilation pipeline, AST manipulation, build integration.

**Goal:** Build foundational infrastructure for TypeScript transformers with minimal viable functionality.

**Status:** Not Started

**Prerequisites:** Phase 1A complete

#### Learning Objectives

- Understand TypeScript Abstract Syntax Trees (AST)
- Learn TypeScript transformer API
- Master build-time code generation integration
- Explore metaprogramming patterns in TypeScript

#### Tasks

- [ ] Install transformer dependencies (`typescript`, `ts-patch`, dev tools)
- [ ] Create `build-tools/` directory for transformer infrastructure
- [ ] Study TypeScript AST structure for type declarations
- [ ] Write basic transformer that detects type declarations
- [ ] Create minimal transformer integration in `tsconfig.json`
- [ ] Build "hello world" transformer that logs detected types
- [ ] Add transformer to build pipeline (verify it runs during compilation)
- [ ] Write tests for transformer detection logic
- [ ] Document transformer architecture in CLAUDE.md

#### Success Criteria

- Transformer successfully integrated with build system
- Can detect and log domain type declarations during compilation
- Tests verify transformer detection logic works correctly
- Build process remains fast and stable

### Phase 1C: Builder Method Generation

**Educational Focus:** Advanced AST manipulation, code generation patterns, fluent API design.

**Goal:** Generate complete fluent builder classes with withX and addX methods.

**Status:** Not Started

**Prerequisites:** Phase 1B complete

#### Learning Objectives

- Master programmatic AST node creation
- Understand TypeScript's factory patterns
- Learn fluent API design principles
- Explore advanced metaprogramming techniques

#### Tasks

- [ ] Design fluent builder API contract (what methods should be generated)
- [ ] Write tests for expected generated builder behavior (TDD for meta-programming)
- [ ] Implement property extraction from type literals
- [ ] Generate basic `withX` methods for simple properties
- [ ] Generate `addX` methods for array properties
- [ ] Create builder class constructor and apply() method
- [ ] Add Immer integration to generated update functions
- [ ] Handle edge cases (optional properties, readonly arrays, nested objects)
- [ ] Generate proper TypeScript types for builder methods
- [ ] Add JSDoc comments to generated methods

#### Success Criteria

- Generated builders provide fluent interface for all domain types
- All builder methods properly typed and documented
- Generated code follows Immer immutability patterns
- TDD tests pass for generated builder functionality

### Phase 1D: Advanced Builder Features

**Educational Focus:** Sophisticated code generation, performance optimization, developer experience.

**Goal:** Add advanced features like validation, nested updates, and performance optimizations.

**Status:** Not Started

**Prerequisites:** Phase 1C complete

#### Learning Objectives

- Optimize generated code for performance
- Integrate validation with code generation
- Handle complex nested object scenarios
- Create sophisticated developer experience features

#### Tasks

- [ ] Add validation integration to generated builders
- [ ] Implement nested object update support
- [ ] Add method chaining optimizations
- [ ] Generate builder types that prevent invalid method combinations
- [ ] Add debugging support for generated builders
- [ ] Create documentation generation for builders
- [ ] Add IDE integration hints (IntelliSense improvements)
- [ ] Performance benchmark generated vs manual builders
- [ ] Add configuration options for transformer behavior
- [ ] Create migration guide for manual to generated builders

#### Success Criteria

- Generated builders match or exceed performance of manual implementations
- Validation seamlessly integrated with fluent interface
- Excellent developer experience with IntelliSense and debugging
- Comprehensive documentation for generated APIs

### Phase 1 Integration & Documentation

#### Final Phase 1 Tasks

- [ ] Update CLAUDE.md with transformer patterns and guidelines
- [ ] Create transformer troubleshooting guide
- [ ] Document performance characteristics and trade-offs
- [ ] Add contribution guidelines for extending transformers
- [ ] Verify all GitHub domain code uses generated builders
- [ ] Remove any manual builder implementations
- [ ] Create examples demonstrating fluent builder usage
- [ ] Benchmark build time impact of code generation

#### Success Criteria for Complete Phase 1

- All GitHub domain types have automatically generated fluent builders
- Build-time code generation integrated seamlessly with development workflow
- Generated code is type-safe, performant, and well-documented
- Developer experience significantly improved through zero-decision fluent APIs
- Foundation established for applying patterns to future domains

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