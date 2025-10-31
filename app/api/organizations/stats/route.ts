import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        o.id,
        o.name,
        o.github_org_name,
        COUNT(DISTINCT r.student_id) as student_count,
        COUNT(DISTINCT r.id) as repo_count,
        COUNT(DISTINCT c.id) FILTER (WHERE c.type = 'pull_request' AND c.state = 'merged') as merged_prs_count
      FROM organizations o
      LEFT JOIN repositories r ON o.id = r.organization_id
      LEFT JOIN contributions c ON r.id = c.repository_id
      GROUP BY o.id, o.name, o.github_org_name
      ORDER BY merged_prs_count DESC, o.name ASC
    `);

    const organizations = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      github_org_name: row.github_org_name,
      student_count: parseInt(row.student_count) || 0,
      repo_count: parseInt(row.repo_count) || 0,
      merged_prs_count: parseInt(row.merged_prs_count) || 0,
    }));

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organization stats:', error);
    return NextResponse.json({ error: 'Failed to fetch organization stats' }, { status: 500 });
  }
}
