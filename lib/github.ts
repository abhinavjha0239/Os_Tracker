import { Octokit } from '@octokit/rest';

export const octokit = new Octokit({
  auth: process.env.GITHUB_PAT_TOKEN || undefined,
});

export interface ParsedRepo {
  owner: string;
  name: string;
}

/**
 * Parse GitHub repository URL or owner/name format
 * Supports:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - owner/repo
 */
export function parseRepoUrl(repoInput: string): ParsedRepo | null {
  try {
    // Handle owner/repo format
    if (!repoInput.includes('://') && repoInput.includes('/')) {
      const parts = repoInput.trim().split('/').filter(Boolean);
      if (parts.length === 2) {
        return { owner: parts[0], name: parts[1].replace(/\.git$/, '') };
      }
      return null;
    }

    // Handle full URLs
    const url = new URL(repoInput);
    if (url.hostname === 'github.com' || url.hostname === 'www.github.com') {
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        return {
          owner: pathParts[0],
          name: pathParts[1].replace(/\.git$/, ''),
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate GitHub username format
 */
export function isValidUsername(username: string): boolean {
  // GitHub username: alphanumeric and hyphens, 1-39 characters, cannot start/end with hyphen
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username);
}

/**
 * Sanitize and validate GitHub URL
 */
export function sanitizeUrl(url: string): string {
  return url.trim().replace(/[\s<>]/g, '');
}
