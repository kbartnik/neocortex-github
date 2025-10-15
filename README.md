# Cortex

A cognitive prosthetic system for ADHD developers that builds a knowledge graph from multiple input sources.

## What is Cortex?

Cortex helps developers with ADHD manage the cognitive overhead of software development by:

- **Externalizing working memory** - Surface context that neurotypicals keep in their heads
- **Preserving hyperfocus** - Deep, narrow functionality that doesn't break flow state
- **Designing for interruption** - All states are resumable after context switches
- **Zero-decision interfaces** - One obvious path forward for every interaction

The system parses artifacts from multiple sources (GitHub issues/PRs, markdown documents, attention monitoring events) into an intermediate representation, then discovers natural correlation patterns to build a knowledge graph that reflects how you actually think about your work.

## Core Principles

- **Hyperfocus preservation over feature breadth** - Build deep before building wide
- **Zero-decision interfaces** - Reduce cognitive load at every interaction
- **Design for interruption** - Context switches are inevitable; plan for them
- **Working memory externalization** - Make implicit context explicit
- **Evidence-based design** - Ground decisions in executive function research

## Project Status

**Current Phase:** Structure refactoring and GitHub domain foundation

**Implemented:**

- GitHub issue parsing and import via REST API
- Basic intermediate representation (IR) layer
- CLI for manual artifact ingestion
- Type-safe error handling with Result types

**In Progress:**

- Refactoring to domain-based architecture
- Implementing immutability patterns with Immer
- Expanding GitHub domain to include Pull Requests

**Planned:**

- Markdown domain (dev logs, user stories)
- Attention monitoring domain (keyboard/mouse patterns)
- Knowledge graph emergence and persistence
- Edge discovery from correlation patterns

## Prerequisites

- **Node.js** 18.x or later
- **pnpm** 8.x or later (install via `npm install -g pnpm`)
- **GitHub Personal Access Token** (for importing GitHub artifacts)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd cortex

# Install dependencies
pnpm install

# Verify installation
pnpm test
```

## Quick Start

### 1. Set Up GitHub Token

Create a GitHub Personal Access Token with `repo` scope:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Cortex Development")
4. Select the `repo` scope
5. Generate and copy the token

Set the token as an environment variable:

```bash
export GITHUB_TOKEN=your_token_here
```

Or add it to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.) for persistence.

### 2. Run Your First Import

Import a GitHub issue to see the IR transformation:

```bash
pnpm cli import https://github.com/owner/repo/issues/123
```

This will fetch the issue from GitHub's API, transform it into the intermediate representation, and display the resulting IR node.

### 3. Run the Test Suite

```bash
# Run all tests
pnpm test

# Run tests in watch mode (recommended during development)
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

## Development

### Common Commands

```bash
pnpm dev              # Development mode with hot reload
pnpm build            # Compile TypeScript to dist/
pnpm start            # Run compiled code
pnpm test             # Run test suite
pnpm test:watch       # Watch mode for tests
pnpm check            # Lint and format check (run before committing)
pnpm check:fix        # Auto-fix linting issues
pnpm docs             # Generate API documentation
pnpm clean            # Clean build artifacts
```

### Development Workflow

**This project follows strict Test-Driven Development (TDD):**

1. **Start with `pnpm test:watch`** - Keep this running in a terminal during development
2. **Write tests first** - Describe expected behavior before implementing
3. **Watch tests fail** - Red phase confirms test is actually testing something
4. **Write minimal code** - Make the test pass (green phase)
5. **Refactor** - Improve code while tests keep passing
6. **Repeat** - Next test, next feature

**Why TDD:**

- Immediate feedback loops maintain focus and engagement
- Tests document your intent when you return after interruption
- Clear structure prevents decision paralysis
- Passing tests provide momentum to keep going

**Before committing:**

- Run `pnpm check` - ensures code quality
- Ensure all tests pass - `pnpm test`
- Follow commit message conventions (see below)

### Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with specific requirements:

```
<type>(<scope>): <description>

- Bullet point 1
- Bullet point 2
- Bullet point 3

Optional explanatory paragraph providing additional context.

BREAKING CHANGE: Description of breaking change (if applicable)
```

**Requirements:**

- **Title must include both type and scope**: `feat(github): add PR parsing`
- **Maximum three bullet points** in the commit body
- **Explanatory paragraph is optional** - use when bullets need more context
- **Breaking changes must be documented** with `BREAKING CHANGE:` in the body

**Examples:**

```
feat(github): add Pull Request parsing support

- Add PR types to domain type definitions
- Implement PR parsing in parser.ts
- Update client to fetch PRs from GitHub API

This enables the system to capture and analyze PR metadata alongside
issues, providing richer context for the knowledge graph.

docs(readme): add commit message conventions

- Document conventional commit format requirements
- Explain semver versioning approach
- Provide examples of well-formed commits
```

**Versioning:** Cortex follows [Semantic Versioning](https://semver.org/). Breaking changes trigger major version bumps, new features trigger minor bumps, and bug fixes trigger patch bumps.

### Project Structure

```
src/
├── domains/              # Domain-specific code
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

**Key structure principle:** Tests are collocated with implementation files (e.g., `parser.ts` and `parser.test.ts` in the same directory) for zero-friction TDD workflow.

### Code Style

- **TypeScript strict mode** - Maximum type safety enabled
- **Immutable data** - All types use `readonly` fields, transformations use Immer
- **Result types** - All fallible operations return `Result<T, E>` (via neverthrow)
- **Biome for linting/formatting** - Run `pnpm check:fix` to auto-fix issues

## Architecture

Cortex uses a domain-based architecture with an intermediate representation (IR) layer:

```
Input Sources → Domain Parsers → IR Layer → Knowledge Graph
```

**Key Design Decision:** We are deliberately delaying IR formalization until we have diverse node types. The edge vocabulary should emerge from observing actual cognitive connection patterns, not theoretical ontology design.

For detailed architecture documentation, development patterns, and contribution guidelines, see **[CLAUDE.md](https://claude.ai/chat/CLAUDE.md)**.

## Why These Technologies?

- **TypeScript** - Strict types catch ADHD-related errors (forgetting edge cases, type confusion)
- **Immer** - Immutability eliminates "update vs. create new" decisions
- **neverthrow** - Result types make errors part of type signatures; can't forget to handle them
- **UUIDv7** - Time-sortable IDs enable context reconstruction after interruptions
- **Vitest** - Fast feedback loops maintain engagement during TDD
- **Biome** - One tool for linting+formatting reduces decision fatigue

See the Dependencies section in [CLAUDE.md](https://claude.ai/chat/CLAUDE.md) for detailed rationale.

## Contributing

This is currently a solo project, but the architecture is designed with future collaboration in mind.

If you're interested in contributing:

1. Read [CLAUDE.md](https://claude.ai/chat/CLAUDE.md) for detailed architecture and development patterns
2. Ensure all tests pass (`pnpm test`)
3. Run code quality checks (`pnpm check`)
4. Follow the established patterns (TDD, immutability, Result types)

## License

[To be determined]

## Acknowledgments

Built with evidence-based approaches to executive function scaffolding and cognitive load reduction for ADHD developers.