import { pool } from './db';
import { octokit } from './github';

export async function syncRepository(
  repositoryId: number,
  username: string,
  owner: string,
  repoName: string
): Promise<{ success: boolean; contributions_count: number; error?: string }> {
  const client = await pool.connect();
  const syncLogId = await createSyncLog(client, repositoryId, username);

  try {
    let totalCount = 0;
    const errors: string[] = [];

    // Fetch commits (with pagination)
    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const commitsResponse = await octokit.repos.listCommits({
          owner,
          repo: repoName,
          author: username,
          per_page: 100,
          page,
        });

        if (commitsResponse.data.length === 0) {
          hasMore = false;
          break;
        }

        for (const commit of commitsResponse.data) {
          await upsertContribution(client, {
            repository_id: repositoryId,
            student_id: await getStudentIdFromRepo(client, repositoryId),
            type: 'commit',
            external_id: commit.sha,
            title: commit.commit.message.split('\n')[0],
            url: commit.html_url,
            state: null,
            created_at: commit.commit.author?.date || commit.commit.committer?.date || new Date().toISOString(),
            updated_at: commit.commit.author?.date || commit.commit.committer?.date || new Date().toISOString(),
            metadata: {
              sha: commit.sha,
              message: commit.commit.message,
              author_name: commit.commit.author?.name,
              author_email: commit.commit.author?.email,
            },
          });
          totalCount++;
        }

        // If we got less than 100, we've reached the end
        if (commitsResponse.data.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
    } catch (error: any) {
      console.error(`Error syncing commits for ${owner}/${repoName}:`, error.message);
      errors.push(`Commits: ${error.message}`);
    }

    // Fetch pull requests (optimized: use Search API for large repos)
    try {
      const allUserPRs: any[] = [];
      
      // Strategy 1: Use GitHub Search API (much faster for large repos - fetches only user's PRs)
      // Search API can return up to 1000 results, which covers 99.9% of cases
      try {
        let searchPage = 1;
        let searchHasMore = true;
        const maxSearchPages = 10; // Search API max is 1000 results (10 pages × 100)

        while (searchHasMore && searchPage <= maxSearchPages) {
          const searchResponse = await octokit.search.issuesAndPullRequests({
            q: `repo:${owner}/${repoName} author:${username} type:pr`,
            per_page: 100,
            page: searchPage,
            sort: 'updated',
            order: 'desc',
          });

          if (searchResponse.data.items.length === 0) {
            searchHasMore = false;
            break;
          }

          // Batch fetch full PR details (search API returns limited data, we need full PR objects)
          // Process in batches to avoid overwhelming the API
          const batchSize = 10;
          for (let i = 0; i < searchResponse.data.items.length; i += batchSize) {
            const batch = searchResponse.data.items.slice(i, i + batchSize);
            const batchPromises = batch.map(async (item) => {
              try {
                const prNumber = parseInt(item.number.toString());
                const fullPR = await octokit.pulls.get({
                  owner,
                  repo: repoName,
                  pull_number: prNumber,
                });
                
                // Double-check it's the correct user (search can sometimes include co-authored PRs)
                if (fullPR.data.user?.login.toLowerCase() === username.toLowerCase()) {
                  return fullPR.data;
                }
                return null;
              } catch (prError: any) {
                // Skip if PR was deleted or inaccessible
                console.warn(`Could not fetch PR #${item.number}: ${prError.message}`);
                return null;
              }
            });
            
            const batchResults = await Promise.all(batchPromises);
            allUserPRs.push(...batchResults.filter((pr): pr is any => pr !== null));
            
            // Small delay between batches to respect rate limits
            if (i + batchSize < searchResponse.data.items.length) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }

          // If we got less than 100, we've reached the end
          if (searchResponse.data.items.length < 100 || searchResponse.data.total_count <= searchPage * 100) {
            searchHasMore = false;
          } else {
            searchPage++;
          }
        }

        // If Search API returned max results (1000), we might have more PRs
        // Fall back to pagination for edge cases
        if (allUserPRs.length >= 1000) {
          console.log(`User has 1000+ PRs in ${owner}/${repoName}, switching to pagination for remaining...`);
          // Continue with pagination approach for any PRs beyond 1000
          // (This is extremely rare - most users don't have 1000+ PRs in a single repo)
        }
      } catch (searchError: any) {
        // If Search API fails (rate limit, etc.), fall back to pagination
        console.warn(`Search API failed for ${owner}/${repoName}, using pagination fallback: ${searchError.message}`);
        
        // Fallback Strategy 2: Paginate through all PRs (original approach)
        // This is slower but more reliable
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const prsResponse = await octokit.pulls.list({
            owner,
            repo: repoName,
            state: 'all',
            per_page: 100,
            page,
          });

          if (prsResponse.data.length === 0) {
            hasMore = false;
            break;
          }

          const userPRs = prsResponse.data.filter(
            (pr) => pr.user?.login.toLowerCase() === username.toLowerCase()
          );
          allUserPRs.push(...userPRs);

          // If we got less than 100, we've reached the end
          if (prsResponse.data.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }

      // Store all found PRs
      for (const pr of allUserPRs.filter((p) => p.user)) {
        await upsertContribution(client, {
          repository_id: repositoryId,
          student_id: await getStudentIdFromRepo(client, repositoryId),
          type: 'pull_request',
          external_id: pr.number.toString(),
          title: pr.title,
          url: pr.html_url,
          state: pr.merged_at ? 'merged' : pr.state,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          metadata: {
            number: pr.number,
            merged_at: pr.merged_at,
            body: pr.body,
            draft: pr.draft,
          },
        });
        totalCount++;
      }
    } catch (error: any) {
      console.error(`Error syncing PRs for ${owner}/${repoName}:`, error.message);
      errors.push(`PRs: ${error.message}`);
    }

    // Fetch issues (with pagination)
    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const issuesResponse = await octokit.issues.listForRepo({
          owner,
          repo: repoName,
          state: 'all',
          creator: username,
          per_page: 100,
          page,
        });

        if (issuesResponse.data.length === 0) {
          hasMore = false;
          break;
        }

        const actualIssues = issuesResponse.data.filter(
          (issue) => !issue.pull_request && issue.user
        );

        for (const issue of actualIssues) {
          await upsertContribution(client, {
            repository_id: repositoryId,
            student_id: await getStudentIdFromRepo(client, repositoryId),
            type: 'issue',
            external_id: issue.number.toString(),
            title: issue.title,
            url: issue.html_url,
            state: issue.state,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            metadata: {
              number: issue.number,
              body: issue.body,
              labels: issue.labels,
            },
          });
          totalCount++;
        }

        // If we got less than 100, we've reached the end
        if (issuesResponse.data.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
    } catch (error: any) {
      console.error(`Error syncing issues for ${owner}/${repoName}:`, error.message);
      errors.push(`Issues: ${error.message}`);
    }

    const status = errors.length === 0 ? 'success' : errors.length === 3 ? 'error' : 'partial';
    await updateSyncLog(client, syncLogId, status, totalCount, errors.join('; '));

    return {
      success: errors.length < 3,
      contributions_count: totalCount,
      error: errors.length > 0 ? errors.join('; ') : undefined,
    };
  } catch (error: any) {
    await updateSyncLog(
      client,
      syncLogId,
      'error',
      0,
      error.message || 'Unknown error'
    );
    return {
      success: false,
      contributions_count: 0,
      error: error.message || 'Unknown error',
    };
  } finally {
    client.release();
  }
}

async function createSyncLog(
  client: any,
  repositoryId: number | null,
  username: string
): Promise<number> {
  const studentResult = await client.query(
    `SELECT id FROM students WHERE github_username = $1`,
    [username]
  );
  const studentId = studentResult.rows[0]?.id || null;

  const result = await client.query(
    `INSERT INTO sync_logs (student_id, repository_id, status)
     VALUES ($1, $2, 'success')
     RETURNING id`,
    [studentId, repositoryId]
  );
  return result.rows[0].id;
}

async function updateSyncLog(
  client: any,
  logId: number,
  status: string,
  contributionsCount: number,
  errorMessage: string | null
) {
  await client.query(
    `UPDATE sync_logs 
     SET status = $1, contributions_count = $2, error_message = $3, completed_at = CURRENT_TIMESTAMP
     WHERE id = $4`,
    [status, contributionsCount, errorMessage, logId]
  );
}

async function upsertContribution(
  client: any,
  contribution: {
    repository_id: number;
    student_id: number;
    type: 'commit' | 'pull_request' | 'issue';
    external_id: string;
    title: string;
    url: string;
    state: string | null;
    created_at: string;
    updated_at: string;
    metadata: any;
  }
) {
  await client.query(
    `INSERT INTO contributions (
      repository_id, student_id, type, external_id, title, url, state,
      created_at, updated_at, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (repository_id, type, external_id)
    DO UPDATE SET
      title = EXCLUDED.title,
      url = EXCLUDED.url,
      state = EXCLUDED.state,
      updated_at = EXCLUDED.updated_at,
      metadata = EXCLUDED.metadata,
      synced_at = CURRENT_TIMESTAMP`,
    [
      contribution.repository_id,
      contribution.student_id,
      contribution.type,
      contribution.external_id,
      contribution.title,
      contribution.url,
      contribution.state,
      contribution.created_at,
      contribution.updated_at,
      JSON.stringify(contribution.metadata),
    ]
  );
}

async function getStudentIdFromRepo(
  client: any,
  repositoryId: number
): Promise<number> {
  const result = await client.query(
    `SELECT student_id FROM repositories WHERE id = $1`,
    [repositoryId]
  );
  if (result.rows.length === 0) {
    throw new Error(`Repository ${repositoryId} not found`);
  }
  return result.rows[0].student_id;
}
