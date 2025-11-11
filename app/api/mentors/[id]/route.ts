import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mentorId = parseInt(params.id);

    // Get mentor details with current mentees
    const mentorResult = await pool.query(`
      SELECT
        m.*,
        COUNT(DISTINCT msa.student_id) AS current_mentees
      FROM mentors m
      LEFT JOIN mentor_student_assignments msa
        ON m.id = msa.mentor_id
        AND msa.is_active = true
      WHERE m.id = $1
      GROUP BY m.id
    `, [mentorId]);

    if (mentorResult.rows.length === 0) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    const mentor = mentorResult.rows[0];

    // Get assigned students
    const studentsResult = await pool.query(`
      SELECT
        s.*,
        msa.assigned_at,
        COUNT(c.id) AS total_contributions
      FROM students s
      INNER JOIN mentor_student_assignments msa ON s.id = msa.student_id
      LEFT JOIN contributions c ON s.id = c.student_id
      WHERE msa.mentor_id = $1 AND msa.is_active = true
      GROUP BY s.id, msa.assigned_at
      ORDER BY s.student_name
    `, [mentorId]);

    // Get recent feedback
    const feedbackResult = await pool.query(`
      SELECT
        mf.*,
        s.student_name,
        s.github_username
      FROM mentor_feedback mf
      INNER JOIN students s ON mf.student_id = s.id
      WHERE mf.mentor_id = $1
      ORDER BY mf.created_at DESC
      LIMIT 10
    `, [mentorId]);

    return NextResponse.json({
      ...mentor,
      students: studentsResult.rows,
      recent_feedback: feedbackResult.rows
    });
  } catch (error) {
    console.error('Error fetching mentor:', error);
    return NextResponse.json({ error: 'Failed to fetch mentor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mentorId = parseInt(params.id);
    const body = await request.json();
    const { name, email, github_username, expertise, bio, max_mentees, is_active } = body;

    const result = await pool.query(
      `UPDATE mentors
       SET name = $1, email = $2, github_username = $3, expertise = $4,
           bio = $5, max_mentees = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, email, github_username, expertise, bio, max_mentees, is_active, mentorId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating mentor:', error);
    return NextResponse.json({ error: 'Failed to update mentor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mentorId = parseInt(params.id);

    // First, unassign all active students
    await pool.query(
      `UPDATE mentor_student_assignments
       SET is_active = false, unassigned_at = CURRENT_TIMESTAMP, reason = 'Mentor deleted'
       WHERE mentor_id = $1 AND is_active = true`,
      [mentorId]
    );

    // Then delete the mentor
    const result = await pool.query(
      'DELETE FROM mentors WHERE id = $1 RETURNING id',
      [mentorId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted_id: mentorId });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    return NextResponse.json({ error: 'Failed to delete mentor' }, { status: 500 });
  }
}