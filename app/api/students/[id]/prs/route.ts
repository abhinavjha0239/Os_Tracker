import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // Get student info
    const studentResult = await pool.query(
      'SELECT id, github_username, student_name, email FROM students WHERE id = $1',
      [id]
    );

    if (studentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = studentResult.rows[0];

    // Get merged PRs organized by org and repo
    const prsResult = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.url,
        c.created_at,
        c.updated_at,
        c.metadata,
        r.id as repo_id,
        r.owner,
        r.name as repo_name,
        r.full_name as repo_full_name,
        COALESCE(o.id, 0) as org_id,
        COALESCE(o.name, r.owner) as org_name,
        COALESCE(o.github_org_name, r.owner) as github_org_name
      FROM contributions c
      INNER JOIN repositories r ON c.repository_id = r.id
      LEFT JOIN organizations o ON r.organization_id = o.id
      WHERE c.student_id = $1 
        AND c.type = 'pull_request' 
        AND c.state = 'merged'
      ORDER BY o.name ASC, r.name ASC, c.created_at DESC
    `, [id]);

    // Organize PRs by organization and repository
    const organizationMap = new Map();

    for (const pr of prsResult.rows) {
      const orgKey = pr.org_name;
      
      if (!organizationMap.has(orgKey)) {
        organizationMap.set(orgKey, {
          id: pr.org_id,
          name: pr.org_name,
          github_org_name: pr.github_org_name,
          repositories: new Map(),
        });
      }

      const org = organizationMap.get(orgKey);
      const repoKey = pr.repo_full_name;

      if (!org.repositories.has(repoKey)) {
        org.repositories.set(repoKey, {
          id: pr.repo_id,
          owner: pr.owner,
          name: pr.repo_name,
          full_name: pr.repo_full_name,
          prs: [],
        });
      }

      org.repositories.get(repoKey).prs.push({
        id: pr.id,
        title: pr.title || `PR #${pr.metadata?.number || pr.id}`,
        url: pr.url,
        pr_number: pr.metadata?.number,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
      });
    }

    // Convert maps to arrays for JSON response
    const organizations = Array.from(organizationMap.values()).map(org => ({
      ...org,
      repositories: Array.from(org.repositories.values()),
    }));

    // Calculate summary stats
    const totalMergedPRs = prsResult.rows.length;
    const totalOrgs = organizationMap.size;
    const totalRepos = organizations.reduce((acc, org) => acc + org.repositories.length, 0);

    return NextResponse.json({
      student,
      summary: {
        total_merged_prs: totalMergedPRs,
        total_organizations: totalOrgs,
        total_repositories: totalRepos,
      },
      organizations,
    });
  } catch (error) {
    console.error('Error fetching student PRs:', error);
    return NextResponse.json({ error: 'Failed to fetch student PRs' }, { status: 500 });
  }
}
