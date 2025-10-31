import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { StudentStats } from '@/lib/db-types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const studentId = searchParams.get('studentId');

  try {
    if (studentId) {
      // Get stats for a specific student
      const statsQuery = `
        SELECT 
          s.id as student_id,
          s.github_username,
          s.student_name,
          COUNT(DISTINCT r.id) as total_repos,
          COUNT(CASE WHEN c.type = 'commit' THEN 1 END) as total_commits,
          COUNT(CASE WHEN c.type = 'pull_request' THEN 1 END) as total_prs,
          COUNT(CASE WHEN c.type = 'issue' THEN 1 END) as total_issues,
          COUNT(c.id) as total_contributions,
          MAX(c.synced_at) as last_sync
        FROM students s
        LEFT JOIN repositories r ON s.id = r.student_id
        LEFT JOIN contributions c ON r.id = c.repository_id
        WHERE s.id = $1
        GROUP BY s.id, s.github_username, s.student_name
      `;

      const statsResult = await pool.query(statsQuery, [studentId]);

      if (statsResult.rows.length === 0) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }

      // Get repo details
      const reposQuery = `
        SELECT 
          r.id,
          r.owner,
          r.name,
          r.full_name,
          COUNT(CASE WHEN c.type = 'commit' THEN 1 END) as commits,
          COUNT(CASE WHEN c.type = 'pull_request' THEN 1 END) as prs,
          COUNT(CASE WHEN c.type = 'issue' THEN 1 END) as issues,
          MAX(c.synced_at) as last_sync
        FROM repositories r
        LEFT JOIN contributions c ON r.id = c.repository_id
        WHERE r.student_id = $1
        GROUP BY r.id, r.owner, r.name, r.full_name
        ORDER BY r.created_at DESC
      `;

      const reposResult = await pool.query(reposQuery, [studentId]);

      return NextResponse.json({
        ...statsResult.rows[0],
        repos: reposResult.rows.map((row) => ({
          id: row.id,
          owner: row.owner,
          name: row.name,
          full_name: row.full_name,
          commits: parseInt(row.commits) || 0,
          prs: parseInt(row.prs) || 0,
          issues: parseInt(row.issues) || 0,
          last_sync: row.last_sync,
        })),
      });
    } else {
      // Get stats for all students
      const query = `
        SELECT 
          s.id as student_id,
          s.github_username,
          s.student_name,
          COUNT(DISTINCT r.id) as total_repos,
          COUNT(CASE WHEN c.type = 'commit' THEN 1 END) as total_commits,
          COUNT(CASE WHEN c.type = 'pull_request' THEN 1 END) as total_prs,
          COUNT(CASE WHEN c.type = 'issue' THEN 1 END) as total_issues,
          COUNT(c.id) as total_contributions,
          MAX(c.synced_at) as last_sync
        FROM students s
        LEFT JOIN repositories r ON s.id = r.student_id
        LEFT JOIN contributions c ON r.id = c.repository_id
        GROUP BY s.id, s.github_username, s.student_name
        ORDER BY total_contributions DESC
      `;

      const result = await pool.query(query);
      return NextResponse.json(result.rows);
    }
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
