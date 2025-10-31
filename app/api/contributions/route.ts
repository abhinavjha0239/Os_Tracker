import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repositoryId = searchParams.get('repositoryId');
  const studentId = searchParams.get('studentId');

  try {
    let query = `
      SELECT c.*, r.owner, r.name as repo_name, r.full_name
      FROM contributions c
      JOIN repositories r ON c.repository_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (repositoryId) {
      query += ` AND c.repository_id = $${paramCount}`;
      params.push(repositoryId);
      paramCount++;
    }

    if (studentId) {
      query += ` AND c.student_id = $${paramCount}`;
      params.push(studentId);
      paramCount++;
    }

    query += ` ORDER BY c.created_at DESC LIMIT 100`;

    const result = await pool.query(query, params);

    // Group by type
    const grouped = {
      commits: result.rows.filter((r) => r.type === 'commit'),
      pullRequests: result.rows.filter((r) => r.type === 'pull_request'),
      issues: result.rows.filter((r) => r.type === 'issue'),
    };

    return NextResponse.json(grouped);
  } catch (error: any) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}