import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentor_id, student_id } = body;

    if (!mentor_id || !student_id) {
      return NextResponse.json({ error: 'Mentor ID and Student ID are required' }, { status: 400 });
    }

    // Check if mentor exists and has capacity
    const mentorCheck = await pool.query(`
      SELECT m.*, COUNT(msa.student_id) AS current_mentees
      FROM mentors m
      LEFT JOIN mentor_student_assignments msa
        ON m.id = msa.mentor_id AND msa.is_active = true
      WHERE m.id = $1
      GROUP BY m.id
    `, [mentor_id]);

    if (mentorCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    const mentor = mentorCheck.rows[0];
    if (mentor.current_mentees >= mentor.max_mentees) {
      return NextResponse.json({ error: 'Mentor has reached maximum mentee capacity' }, { status: 400 });
    }

    // Check if assignment already exists
    const existingAssignment = await pool.query(
      'SELECT * FROM mentor_student_assignments WHERE mentor_id = $1 AND student_id = $2 AND is_active = true',
      [mentor_id, student_id]
    );

    if (existingAssignment.rows.length > 0) {
      return NextResponse.json({ error: 'Student is already assigned to this mentor' }, { status: 409 });
    }

    // Deactivate any existing mentor assignments for the student
    await pool.query(
      `UPDATE mentor_student_assignments
       SET is_active = false, unassigned_at = CURRENT_TIMESTAMP, reason = 'Reassigned to new mentor'
       WHERE student_id = $1 AND is_active = true`,
      [student_id]
    );

    // Create new assignment
    const result = await pool.query(
      `INSERT INTO mentor_student_assignments (mentor_id, student_id, is_active)
       VALUES ($1, $2, true)
       RETURNING *`,
      [mentor_id, student_id]
    );

    // Update student's mentor_id
    await pool.query(
      'UPDATE students SET mentor_id = $1 WHERE id = $2',
      [mentor_id, student_id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error assigning student to mentor:', error);
    return NextResponse.json({ error: 'Failed to assign student to mentor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentor_id, student_id, reason } = body;

    if (!mentor_id || !student_id) {
      return NextResponse.json({ error: 'Mentor ID and Student ID are required' }, { status: 400 });
    }

    // Deactivate assignment
    const result = await pool.query(
      `UPDATE mentor_student_assignments
       SET is_active = false, unassigned_at = CURRENT_TIMESTAMP, reason = $3
       WHERE mentor_id = $1 AND student_id = $2 AND is_active = true
       RETURNING *`,
      [mentor_id, student_id, reason || 'Unassigned by admin']
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Remove mentor_id from student
    await pool.query(
      'UPDATE students SET mentor_id = NULL WHERE id = $1',
      [student_id]
    );

    return NextResponse.json({ success: true, assignment: result.rows[0] });
  } catch (error) {
    console.error('Error unassigning student from mentor:', error);
    return NextResponse.json({ error: 'Failed to unassign student from mentor' }, { status: 500 });
  }
}