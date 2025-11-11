import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orgId = parseInt(params.id);

    if (isNaN(orgId)) {
      return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT r.student_id) as student_count,
        COUNT(DISTINCT r.id) as repo_count,
        COUNT(DISTINCT c.id) FILTER (WHERE c.type = 'pull_request' AND c.state = 'merged') as merged_prs_count
      FROM organizations o
      LEFT JOIN repositories r ON o.id = r.organization_id
      LEFT JOIN contributions c ON r.id = c.repository_id
      WHERE o.id = $1
      GROUP BY o.id`,
      [orgId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        student_count: 0,
        repo_count: 0,
        merged_prs_count: 0
      });
    }

    const stats = {
      student_count: parseInt(result.rows[0].student_count) || 0,
      repo_count: parseInt(result.rows[0].repo_count) || 0,
      merged_prs_count: parseInt(result.rows[0].merged_prs_count) || 0
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching organization stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization stats' },
      { status: 500 }
    );
  }
}
