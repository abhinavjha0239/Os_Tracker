import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        s.id as student_id,
        s.github_username,
        s.student_name,
        s.email,
        COUNT(DISTINCT c.id) FILTER (WHERE c.type = 'pull_request' AND c.state = 'merged') as merged_prs_count,
        MAX(sync.completed_at) as last_sync
      FROM students s
      LEFT JOIN contributions c ON s.id = c.student_id
      LEFT JOIN sync_logs sync ON s.id = sync.student_id
      GROUP BY s.id, s.github_username, s.student_name, s.email
      ORDER BY merged_prs_count DESC, s.student_name ASC
    `);

    const students = result.rows.map(row => ({
      student_id: row.student_id,
      github_username: row.github_username,
      student_name: row.student_name,
      email: row.email,
      merged_prs_count: parseInt(row.merged_prs_count) || 0,
      last_sync: row.last_sync,
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return NextResponse.json({ error: 'Failed to fetch student stats' }, { status: 500 });
  }
}
