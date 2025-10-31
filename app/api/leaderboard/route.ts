import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10');
  const month = searchParams.get('month'); // Format: YYYY-MM
  const organization_id = searchParams.get('organization_id');

  try {
    let query = `
      SELECT 
        s.id as student_id,
        s.github_username,
        s.student_name,
        COUNT(DISTINCT c.id) FILTER (WHERE c.type = 'pull_request' AND c.state = 'merged') as merged_prs_count,
        MAX(c.created_at) FILTER (WHERE c.type = 'pull_request' AND c.state = 'merged') as last_pr_date
      FROM students s
      LEFT JOIN contributions c ON s.id = c.student_id
      LEFT JOIN repositories r ON c.repository_id = r.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (month) {
      paramCount++;
      query += ` AND DATE_TRUNC('month', c.created_at) = DATE_TRUNC('month', $${paramCount}::date)`;
      params.push(month + '-01');
    }

    if (organization_id) {
      paramCount++;
      query += ` AND r.organization_id = $${paramCount}`;
      params.push(organization_id);
    }

    query += `
      GROUP BY s.id, s.github_username, s.student_name
      HAVING COUNT(DISTINCT c.id) FILTER (WHERE c.type = 'pull_request' AND c.state = 'merged') > 0
      ORDER BY merged_prs_count DESC, s.student_name ASC
      LIMIT $${paramCount + 1}
    `;
    params.push(limit);

    const result = await pool.query(query, params);

    // Add rank to results
    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      student_id: row.student_id,
      github_username: row.github_username,
      student_name: row.student_name,
      merged_prs_count: parseInt(row.merged_prs_count) || 0,
      last_pr_date: row.last_pr_date,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
