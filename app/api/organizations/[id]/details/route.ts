import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // Get organization info
    const orgResult = await pool.query(
      'SELECT id, name, github_org_name FROM organizations WHERE id = $1',
      [id]
    );

    if (orgResult.rows.length === 0) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const organization = orgResult.rows[0];

    // Get repositories with PR counts - find repos by organization_id OR by matching owner to org's GitHub name
    // Group by full_name to get unique repositories (same repo might be linked to multiple students)
    const reposResult = await pool.query(`
      SELECT 
        MAX(r.id) as id,
        r.owner,
        r.name,
        r.full_name,
        COUNT(DISTINCT c.id) FILTER (WHERE c.type = 'pull_request' AND c.state = 'merged') as merged_prs_count
      FROM repositories r
      LEFT JOIN contributions c ON r.id = c.repository_id
      WHERE r.organization_id = $1 OR r.owner = $2
      GROUP BY r.owner, r.name, r.full_name
      ORDER BY merged_prs_count DESC, r.name ASC
    `, [id, organization.github_org_name]);

    // Get students contributing to this organization - find students who have contributions to org repos
    const studentsResult = await pool.query(`
      SELECT DISTINCT
        s.id,
        s.github_username,
        s.student_name,
        COUNT(DISTINCT c.id) FILTER (WHERE c.type = 'pull_request' AND c.state = 'merged') as merged_prs_count
      FROM students s
      INNER JOIN contributions c ON c.student_id = s.id
      INNER JOIN repositories r ON c.repository_id = r.id
      WHERE (r.organization_id = $1 OR r.owner = $2)
        AND c.type = 'pull_request' 
        AND c.state = 'merged'
      GROUP BY s.id, s.github_username, s.student_name
      ORDER BY merged_prs_count DESC, s.student_name ASC
    `, [id, organization.github_org_name]);

    // Get all PRs for this organization - include repos by organization_id OR by matching owner
    const prsResult = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.url,
        c.created_at,
        c.updated_at,
        c.metadata,
        r.id as repo_id,
        r.name as repo_name,
        r.full_name as repo_full_name,
        s.id as student_id,
        s.github_username,
        s.student_name
      FROM contributions c
      INNER JOIN repositories r ON c.repository_id = r.id
      INNER JOIN students s ON c.student_id = s.id
      WHERE (r.organization_id = $1 OR r.owner = $2)
        AND c.type = 'pull_request' 
        AND c.state = 'merged'
      ORDER BY r.name ASC, c.created_at DESC
    `, [id, organization.github_org_name]);

    // Build repository map - start with all repositories, then add PRs
    const repositoriesMap = new Map();

    // First, add all repositories (even without PRs)
    for (const repo of reposResult.rows) {
      const repoKey = repo.full_name;
      if (!repositoriesMap.has(repoKey)) {
        repositoriesMap.set(repoKey, {
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          prs: [],
        });
      }
    }

    // Then, add PRs to their respective repositories
    for (const pr of prsResult.rows) {
      const repoKey = pr.repo_full_name;
      
      if (!repositoriesMap.has(repoKey)) {
        repositoriesMap.set(repoKey, {
          id: pr.repo_id,
          name: pr.repo_name,
          full_name: pr.repo_full_name,
          prs: [],
        });
      }

      repositoriesMap.get(repoKey).prs.push({
        id: pr.id,
        title: pr.title || `PR #${pr.metadata?.number || pr.id}`,
        url: pr.url,
        pr_number: pr.metadata?.number,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        student: {
          id: pr.student_id,
          github_username: pr.github_username,
          student_name: pr.student_name,
        },
      });
    }

    const repositories = Array.from(repositoriesMap.values());

    // Calculate summary stats
    const summary = {
      total_repositories: repositories.length, // All repositories linked to org
      total_students: studentsResult.rows.length,
      total_merged_prs: prsResult.rows.length,
    };

    return NextResponse.json({
      organization,
      summary,
      repositories,
      students: studentsResult.rows.map(row => ({
        id: row.id,
        github_username: row.github_username,
        student_name: row.student_name,
        merged_prs_count: parseInt(row.merged_prs_count) || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching organization details:', error);
    return NextResponse.json({ error: 'Failed to fetch organization details' }, { status: 500 });
  }
}
