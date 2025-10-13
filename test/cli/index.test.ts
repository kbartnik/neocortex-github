import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ok } from 'neverthrow';
import * as importModule from '../../src/cli/commands/import';

// Mock the entire module with a factory function
vi.mock('../../src/cli/commands/import', () => ({
  importCommand: vi.fn(),
}));

describe('CLI entry point', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should parse import command and call importCommand with URL', async () => {
    // Setup mock to return a successful result with an empty array
    vi.mocked(importModule.importCommand).mockResolvedValue(ok(undefined as any));

    // Simulate CLI invocation: neocortex import https://github.com/owner/repo
    const { runCLI } = await import('../../src/cli/index');
    await runCLI(['import', 'https://github.com/owner/repo']);

    // importCommand receives the arguments after 'import' as an array
    expect(importModule.importCommand).toHaveBeenCalledWith(['https://github.com/owner/repo']);
  });
});
