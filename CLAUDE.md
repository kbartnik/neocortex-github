# CLAUDE.md

Comprehensive guidance for Claude Code when working with this repository.

**Last Updated:** October 2025, following structure refactoring

**⚠️ Update this document when:**

- Major architectural decisions are made
- New development patterns are established
- Directory structure changes
- Path aliases are modified
- New domains are added
- Testing patterns change

**Note on TASKS.md:** When you complete approved work, update [TASKS.md](https://claude.ai/chat/TASKS.md) to check off completed tasks and add completion notes. Keep the roadmap current.

## Project Overview

**Cortex** is a cognitive prosthetic system for ADHD developers that builds a knowledge graph from multiple input sources. The system parses artifacts (GitHub issues/PRs, markdown documents, attention events) into an intermediate representation (IR) layer, then discovers edges between nodes based on natural correlation patterns.

### Core Principles

- **Test-Driven Development (TDD)** - Write tests before implementation, always
- **Hyperfocus preservation over feature breadth** - Build deep, narrow functionality first
- **Zero-decision interfaces** - One obvious path forward for every interaction
- **Design for interruption** - All states must be resumable after context switches
- **Working memory externalization** - Surface context that neurotypicals keep in their heads
- **Evidence-based** - Ground decisions in executive function scaffolding research

### Key Architectural Insight

We are **deliberately delaying IR formalization** until we have diverse node types. This prevents premature abstraction—the edge vocabulary should emerge from observing actual cognitive connection patterns, not theoretical ontology design.

**Current Strategy:** Build representative samples first (GitHub issues/PRs, markdown docs, attention events), discover natural correlation patterns second, then formalize IR schema based on observed usage.

## Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm dev              # Development with hot reload
pnpm build            # Compile TypeScript to dist/
pnpm start            # Run compiled code

# Testing (TDD workflow - start with test:watch)
pnpm test:watch       # Watch mode - PRIMARY DEVELOPMENT MODE
pnpm test             # Run all tests once
pnpm test:ui          # UI interface
pnpm test:coverage    # Coverage report

# Code Quality
pnpm check            # Lint + format check (run before committing)
pnpm check:fix        # Auto-fix linting issues
pnpm format           # Format only

# Documentation
pnpm docs             # Generate API docs with TypeDoc
pnpm docs:watch       # Watch and regenerate

# CLI
pnpm cli import <url> # Import GitHub issue to IR
pnpm clean            # Clean build artifacts
```

**Primary development workflow:** Run `pnpm test:watch` first, keep it running, write tests before code.

## Architecture

### Directory Structure

Domain-based organization with collocated tests for zero-friction TDD workflow:

```
src/
├── domains/              # Self-contained domain modules
│   ├── github/
│   │   ├── types.ts
│   │   ├── types.test.ts
│   │   ├── parser.ts
│   │   ├── parser.test.ts
│   │   ├── client.ts
│   │   ├── client.test.ts
│   │   ├── errors.ts
│   │   └── errors.test.ts
│   ├── markdown/         # Future domain
│   └── attention/        # Future domain
├── ir/                   # Intermediate representation layer
│   ├── types.ts
│   ├── types.test.ts
│   ├── transforms.ts
│   └── transforms.test.ts
├── core/                 # Cross-domain utilities
│   ├── http.ts
│   ├── http.test.ts
│   ├── validation.ts
│   └── validation.test.ts
├── errors/               # Shared error base classes
│   ├── index.ts
│   ├── index.test.ts
│   ├── InternalError.ts
│   └── InternalError.test.ts
├── cli/                  # Command-line interface
│   ├── commands/
│   │   ├── import.ts
│   │   └── import.test.ts
│   └── index.ts
└── index.ts
```

**Structure Principles:**

- **Domains are self-contained**: Consistent internal structure (types, parser/client, errors)
- **Tests are collocated**: `parser.ts` and `parser.test.ts` live together for zero-friction TDD
- **Flat within domains**: Files not subdirectories reduce navigation overhead
- **IR at top level**: Central abstraction, not a domain itself
- **File size guidelines**: Split only when >10 types or >200 lines

### Path Aliases

Domain-prefixed scheme for clarity and consistency:

```typescript
@domains/*  →  src/domains/*   // Domain-specific code
@ir/*       →  src/ir/*         // Intermediate representation
@core/*     →  src/core/*       // Cross-domain utilities
@errors/*   →  src/errors/*     // Shared error classes
```

**Import Guidelines:**

```typescript
// Within same domain: relative imports
import type { Issue } from "./types";
import { validateIssueState } from "./parser";

// Cross-layer: path aliases
import type { GitHubIssueNode } from "@ir/types";
import { HTTP_STATUS } from "@core/http";
import { InternalError } from "@errors/InternalError";

// Cross-domain: path aliases
import type { Issue } from "@domains/github/types";
import { parseMarkdown } from "@domains/markdown/parser";
```

### Core Patterns

#### Immutability with Immer

**All data objects are immutable.** Eliminates "update vs. create new" decisions, enables time-travel debugging, simplifies reasoning about data flow.

```typescript
import { produce } from 'immer';

type GitHubIssue = {
  readonly id: number;
  readonly title: string;
  readonly state: 'open' | 'closed';
};

// Creating new versions, never mutating
const updatedIssue = produce(issue, draft => {
  draft.state = 'closed';
});
```

#### Error Handling with NeverThrow

**All fallible operations return Result types** for type-safe error handling without exceptions.

```typescript
import { Result, ResultAsync, ok, err } from 'neverthrow';

// Synchronous
function parseIssue(data: unknown): Result<Issue, ParseError> {
  if (!isValidData(data)) {
    return err({ type: 'invalid_data', details: 'Missing required fields' });
  }
  return ok(issue);
}

// Asynchronous
function fetchIssue(url: string): ResultAsync<Issue, FetchError> {
  return ResultAsync.fromPromise(
    fetch(url).then(r => r.json()),
    (e) => ({ type: 'network_error', cause: e })
  );
}

// Chaining
const result = await fetchIssue(url)
  .andThen(parseIssue)
  .map(issue => issue.title)
  .match(
    (title) => console.log('Success:', title),
    (error) => console.error('Failed:', error.type)
  );
```

**Benefits:** Errors are part of type signatures, composable error handling, works seamlessly with TypeScript's type narrowing.

#### Test-Driven Development (TDD) Workflow

**TDD is non-negotiable.** Tests are always written before implementation. This is not optional.

**Why TDD for ADHD development:**

- **Immediate feedback loops** - Passing tests provide dopamine hits that maintain engagement
- **Structured workflow** - Clear next steps prevent decision paralysis
- **Context preservation** - Tests document intent when you return after interruption
- **Hyperfocus alignment** - Deep dive into one test at a time, not scattered implementation
- **Working memory externalization** - Test cases capture requirements you'd otherwise forget

**Standard TDD Cycle:**

1. **Start watch mode**: `pnpm test:watch` (leave running entire session)
2. **Write failing test**: Describe expected behavior in `*.test.ts`
3. **Run tests**: Watch mode shows immediate failure (red)
4. **Write minimal code**: Make the test pass in `*.ts`
5. **Run tests**: Watch mode shows immediate success (green)
6. **Refactor**: Improve code while tests keep passing
7. **Repeat**: Next test, next behavior

**Test colocation enables zero-friction TDD:**

- `parser.ts` and `parser.test.ts` in same directory
- Quick toggle between test and implementation (same folder, adjacent files)
- No hunting for test files breaks flow state
- Visual accountability - can't lose tests

**Testing philosophy:**

- **Cognitive outcome testing** - Test that features reduce cognitive load, not just technical correctness
- **Test behavior, not implementation** - Tests should survive refactoring
- **One concept per test** - Clear, focused test names like `test('parses issue with labels')`
- **Arrange-Act-Assert** - Clear test structure reduces mental overhead

**Example TDD workflow:**

```typescript
// 1. Write test first (parser.test.ts)
test('parses GitHub issue URL into repository and issue number', () => {
  const url = 'https://github.com/owner/repo/issues/123';
  const result = parseGitHubUrl(url);
  
  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toEqual({
    owner: 'owner',
    repo: 'repo',
    issueNumber: 123
  });
});

// 2. Watch mode shows failure (function doesn't exist yet)

// 3. Write minimal implementation (parser.ts)
function parseGitHubUrl(url: string): Result<ParsedUrl, ParseError> {
  // ... implementation to make test pass
}

// 4. Watch mode shows success (green)

// 5. Write next test for edge case, repeat cycle
```

### File Naming Conventions

**Consistency is critical for reducing cognitive load:**

- **Use plural for collections**: `types.ts`, `errors.ts`, `transforms.ts` (NOT `type.ts`, `error.ts`)
- **Use descriptive action verbs**: `parser.ts`, `capture.ts`, `transforms.ts`
- **PascalCase for class-containing files**: `GitHubClient.ts`, `InternalError.ts`
- **Tests match exactly**: `parser.test.ts` sits next to `parser.ts`, `types.test.ts` next to `types.ts`
- **Lowercase with hyphens for multi-word**: `github-client.ts` (if needed, though prefer single-word or PascalCase)

**index.ts files serve exactly two purposes:**

1. **Barrel exports** (most common) - Re-export public API from a module
    - `src/index.ts` - Defines public library API; entry point for TypeDoc documentation
    - `src/domains/github/index.ts` - Exports GitHub domain's public API
    - `src/ir/index.ts` - Exports IR layer's public API
2. **Program entry points** (rare) - Start a program
    - `src/cli/index.ts` - CLI program entry point (currently the only entry point)

**Implementation code never goes in index.ts** - always use descriptive filenames. The project is primarily a library with the CLI as one consumer of that library.

**Why consistency matters:**

- Reduces "where should I put this?" decisions
- Makes file lists scannable - patterns are immediately obvious
- Autocomplete works better with predictable naming
- Easier to grep/search when conventions are consistent

### TypeScript Configuration

Very strict configuration for maximum safety:

- `strict: true` - All strict checks enabled
- `noImplicitReturns: true` - All code paths must return
- `noUncheckedIndexedAccess: true` - Array/object indexing returns `T | undefined`
- `exactOptionalPropertyTypes: true` - Distinguish undefined vs. absent properties
- `useUnknownInCatchVariables: true` - Catch variables are `unknown`, not `any`
- `verbatimModuleSyntax: true` - Enforce explicit type imports
- `noExplicitAny: "error"` - No `any` types allowed (via Biome)

## Current State & Development Priorities

**For detailed task checklists and phase progress, see [TASKS.md](https://claude.ai/chat/TASKS.md).**

### Current Phase: Phase 0 - Structure Refactoring

Consolidating existing GitHub code into domain-based structure with collocated tests.

### Implemented

**IR Layer** (`src/ir/`):

- `IRNode<T>` - Base interface with UUIDv7, type, sourceId, title, created_at, data payload
- `GitHubIssueNode` - Concrete IR node type for GitHub issues
- `transformGitHubIssue()` - Transform GitHub API response to IR node

**GitHub Domain** (partially in `src/github/`, **needs refactoring**):

- Issue types and parsing
- GitHub REST API client with authentication
- URL parsing for repo/issue identification
- Rate limiting and error handling

**CLI** (`src/cli/`):

- `import` command for ingesting GitHub issues

### Upcoming Phases

1. **Phase 1: Apply Immutability** - Implement Immer patterns throughout GitHub domain
2. **Phase 2: Expand GitHub Domain** - Add Pull Request parsing
3. **Phase 3: Markdown Domain** - Dev logs and user stories
4. **Phase 4: Attention Domain** - Keyboard/mouse event capture
5. **Phase 5: Knowledge Graph** - Formalize IR schema and edge discovery

### Not Yet Implemented

- Immutability with Immer (types exist but not enforced)
- Pull Request parsing
- Markdown domain (dev logs, user stories)
- Attention monitoring domain (keyboard/mouse events)
- Knowledge graph persistence
- Edge discovery algorithms

## Development Patterns

### Adding a New Domain

**Always follow TDD - tests before implementation.**

1. Start `pnpm test:watch` in a terminal
2. Create `src/domains/{domain-name}/`
3. Add `types.ts` with readonly type definitions
4. Add `types.test.ts` - write type validation tests first
5. Add main logic file:
    - `parser.ts` for parsing/extraction
    - `capture.ts` for event monitoring
    - `client.ts` if API interaction needed
6. Add corresponding `.test.ts` - write behavior tests before implementing
7. Implement functionality to make tests pass (watch mode provides instant feedback)
8. Add `utils.ts` and `errors.ts` if needed (with tests first)
9. Refactor while tests keep passing

### Working with Result Types

```typescript
// Return a Result
return ok(value);
return err(error);

// Transform Result
result.map(value => transform(value))
result.andThen(value => anotherResult(value))

// Handle Result
result.match(
  (value) => handleSuccess(value),
  (error) => handleError(error)
)
```

### Testing Immutability

Verify objects are truly immutable at compile-time and runtime:

```typescript
test('parsed object is immutable at compile time', () => {
  const result = parseGitHubIssue(apiResponse);
  
  // Should cause TypeScript error
  // @ts-expect-error - testing immutability
  result.title = 'modified';
});

test('parsed object is immutable at runtime', () => {
  const result = parseGitHubIssue(apiResponse);
  
  // Mutation should fail
  expect(() => {
    (result as any).title = 'modified';
  }).toThrow();
});
```

**Why both tests:**

- TypeScript catches most issues at compile time
- Runtime checks ensure immutability isn't bypassed with `any` casts
- Provides documentation of immutability intent

## Code Quality

### Biome Configuration

- 2-space indentation
- No `any` types allowed
- Import/export type separation enforced
- Unused variables/imports are errors
- Use `type` over `interface` (enforced)

### Git Workflow & Commit Conventions

**Commit Message Format:**

```
<type>(<scope>): <description>

- Bullet point 1
- Bullet point 2
- Bullet point 3

Optional explanatory paragraph providing additional context.

BREAKING CHANGE: Description of breaking change (if applicable)
```

**Rules:**

- **Title**: Must include both type and scope: `feat(github): add PR parsing`
- **Bullets**: Maximum three bullet points in the body
- **Explanatory paragraph**: Optional, use when bullets need additional context
- **Breaking changes**: Must be called out in commit body with `BREAKING CHANGE:` prefix

**Common types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `refactor` - Code refactoring without behavior change
- `test` - Adding or updating tests
- `chore` - Maintenance tasks (dependencies, tooling)

**Common scopes:**

- Domain names: `github`, `markdown`, `attention`
- Layers: `ir`, `core`, `cli`
- Infrastructure: `build`, `deps`, `config`

**Versioning:** This project follows [Semantic Versioning](https://semver.org/):

- MAJOR version for breaking changes (incompatible API changes)
- MINOR version for new features (backward compatible)
- PATCH version for bug fixes (backward compatible)

Breaking changes must be explicitly documented in the commit body to signal version impact.

### Documentation Style

Use TSDoc comments for API documentation:

```typescript
/**
 * Transforms a GitHub API issue response into an internal IR node.
 *
 * This function serves as the boundary between external GitHub API data
 * and internal data structures. It validates the data, normalizes the
 * structure, and generates a unique identifier for tracking.
 *
 * @param githubApiResponse - Raw issue data from the GitHub API
 * @param owner - Repository owner (needed for sourceId)
 * @param repo - Repository name (needed for sourceId)
 * @returns A Result containing either the transformed IR node or a validation error
 *
 * @example
 * ```typescript
 * const apiResponse: Issue = { /* ... */ };
 * const result = transformGitHubIssue(apiResponse, "owner", "repo");
 * ```
 */
```

## Dependencies

### Core Runtime

**`immer`** - Immutable data structures with ergonomic update syntax

- _Why_: Eliminates "update vs. create new" decisions (zero-decision principle)
- _How_: All domain types use `readonly` fields; transformations use `produce()`
- See "Immutability with Immer" section for detailed patterns

**`neverthrow`** - Result types for type-safe error handling

- _Why_: Makes errors part of type signatures; can't forget to handle them
- _How_: All fallible operations return `Result<T, E>` or `ResultAsync<T, E>`
- See "Error Handling with NeverThrow" section for detailed patterns

**`ts-pattern`** - Pattern matching for discriminated unions

- _Why_: Exhaustive matching on error types and node types prevents missed cases
- _How_: Used for handling Result errors and IR node type dispatching
- Complements TypeScript's type narrowing with runtime safety

**`uuidv7`** - Time-sortable UUID generation (UUIDv7 spec)

- _Why_: IR nodes need unique IDs that preserve temporal ordering for context reconstruction
- _How_: Every `IRNode` gets a UUIDv7 on creation; sorts naturally by creation time
- Critical for "design for interruption" - can resume context by time-sorting nodes

**`commander`** - CLI framework for the import command

- _Why_: Simple, well-documented, minimal cognitive overhead for CLI building
- _How_: Powers `pnpm cli import <url>` for manual GitHub artifact ingestion
- Will expand as more import sources are added

### Development Tools

**`typescript`** - Type safety with very strict configuration

- _Why_: Strict types catch ADHD-related errors (forgetting edge cases, type confusion)
- _How_: Maximum strictness enabled (see TypeScript Configuration section)
- Forces explicit error handling, prevents implicit any, catches all code paths

**`tsx`** - Fast TypeScript execution with hot reload

- _Why_: Hot reload preserves hyperfocus flow state - no manual restart friction
- _How_: `pnpm dev` watches files and auto-reloads on changes
- Speed matters for ADHD workflow - fast feedback loops maintain engagement

**`vitest`** - Fast unit testing with native TypeScript support

- _Why_: Speed + native ESM + TypeScript support without configuration overhead
- _How_: Watch mode (`pnpm test:watch`) provides instant feedback during TDD
- Faster than Jest; ADHD-friendly instant gratification from passing tests

**`@biomejs/biome`** - Fast, unified linting and formatting

- _Why_: One tool instead of ESLint + Prettier reduces decision fatigue
- _How_: `pnpm check` runs both lint and format checks; `pnpm check:fix` auto-fixes
- Speed reduces friction in tight iteration loops (critical for maintaining flow)

**`typedoc`** - API documentation generation from TSDoc comments

- _Why_: Documentation as code reduces context switching to separate docs
- _How_: `pnpm docs` generates HTML/Markdown from source code comments
- Externalizes working memory - detailed API docs compensate for ADHD memory limitations