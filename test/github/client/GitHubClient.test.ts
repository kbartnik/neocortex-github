// test/clients/gitHub.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { GitHubClient } from '../../../src';

describe('GitHubClient', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        global.fetch = fetchMock;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('authentication', () => {
        it('makes requests without Authorization header when no token provided', async () => {
            const client = new GitHubClient();

            fetchMock.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    number: 123,
                    title: 'Test Issue',
                    state: 'open',
                    body: 'Test body',
                    labels: [],
                    assignees: [],
                    created_at: '2025-01-01T00:00:00Z'
                })
            });

            await client.getIssue('owner', 'repo', 123);

            expect(fetchMock).toHaveBeenCalledWith(
                'https://api.github.com/repos/owner/repo/issues/123',
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'neocortex-github/1.0.0'
                    }
                }
            );
        });
    });

    it('includes Authorization header with Bearer token when token provided', async () => {
        const token = 'github_pat_test123';
        const client = new GitHubClient(token);

        fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async() => ({
                number: 123,
                title: 'Test Issue',
                state: 'open',
                body: 'Test body',
                labels: [],
                assignees: [],
                created_at: '2025-01-01T00:00:00Z'
            })
        });

        await client.getIssue('owner', 'repo', 123);

        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.github.com/repos/owner/repo/issues/123',
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'neocortex-github/1.0.0',
                    "Authorization": 'Bearer github_pat_test123'
                }
            }
        );
    });
});