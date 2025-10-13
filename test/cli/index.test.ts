import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ok, err } from 'neverthrow';
import * as importModule from '../../src/cli/commands/import';

// Mock the entire module with a factory function
vi.mock('../../src/cli/commands/import', () => ({
  importCommand: vi.fn(),
}));

describe('CLI entry point', () => {
  let mockExit: any;

  beforeEach(() => {
    vi.resetAllMocks();
    mockExit = vi.spyOn(process, 'exit').mockImplementation((() => { }) as any);
  });

  afterEach(() => {
    mockExit.mockRestore();
  });

  it('should parse import command and call importCommand with URL', async () => {
    // Setup mock to return a successful result with an empty array
    vi.mocked(importModule.importCommand).mockResolvedValue(ok([
      {
        id: "123",
        type: "github-issue",
        sourceId: "github:owner/repo#1",
        title: "Test Issue",
        data: {
          number: 1,
          body: "test",
          state: "open",
          labels: [],
          assignees: []
        },
        created_at: "2025-01-01T00:00:00Z"
      }
    ] as any));


    // Simulate CLI invocation: neocortex import https://github.com/owner/repo
    const { runCLI } = await import('../../src/cli/index');
    await runCLI(['import', 'https://github.com/owner/repo']);

    // importCommand receives the arguments after 'import' as an array
    expect(importModule.importCommand).toHaveBeenCalledWith(['https://github.com/owner/repo']);
  });

  it('should exit with code 0 on successful import', async () => {
    // Setup mock to return successful result with one node
    vi.mocked(importModule.importCommand).mockResolvedValue(ok({
      id: '123',
      type: 'github-issue',
      sourceId: 'github:owner/repo#1',
      title: 'Test Issue',
      data: { number: 1, body: 'test', state: 'open', labels: [], assignees: [] },
      created_at: '2025-01-01T00:00:00Z'
    }));

    const mockExit = vi.spyOn(process, 'exit').mockImplementation((() => { }) as any);

    const { runCLI } = await import('../../src/cli/index');
    await runCLI(['import', 'https://github.com/owner/repo']);

    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it("should exit with code 1 on import failure", async () => {
    // Setup mock to return error result
    vi.mocked(importModule.importCommand).mockResolvedValue(err({
      type: "not_found",
      target: "owner/repo#123",
      url: "https://github.com/owner/repo/issues/123"
    }));

    const { runCLI } = await import("../../src/cli/index");
    await runCLI(['import', 'https://github.com/bad']);

    expect(mockExit).toHaveBeenCalledWith(1);
  });


  it("should print success message with node count", async () => {
    // Setup mock to return successful result with two nodes
    vi.mocked(importModule.importCommand).mockResolvedValue(ok([
      {
        id: '123',
        type: 'github-issue',
        sourceId: 'github:owner/repo#1',
        title: 'First Issue',
        data: { number: 1, body: 'test', state: 'open', labels: [], assignees: [] },
        created_at: '2025-01-01T00:00:00Z'
      },
      {
        id: '456',
        type: 'github-issue',
        sourceId: 'github:owner/repo#2',
        title: 'Second Issue',
        data: { number: 2, body: 'test', state: 'open', labels: [], assignees: [] },
        created_at: '2025-01-01T00:00:00Z'
      }
    ] as any
    ));

    const mockLog = vi.spyOn(console, 'log').mockImplementation(() => { });

    const { runCLI } = await import("../../src/cli/index");
    await runCLI(['import', 'https://github.com/owner/repo']);

    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('2'));
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('issue'));
  });
});
