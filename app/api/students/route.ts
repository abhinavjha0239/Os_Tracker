import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { Student } from '@/lib/db-types';

export async function GET() {
  try {
    const result = await pool.query<Student>(
      `SELECT * FROM students ORDER BY created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { github_username, student_name, email } = body;

    if (!github_username) {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      );
    }

    const result = await pool.query<Student>(
      `INSERT INTO students (github_username, student_name, email)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [github_username, student_name || null, email || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      // Unique constraint violation
      return NextResponse.json(
        { error: 'Student with this GitHub username already exists' },
        { status: 409 }
      );
    }
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
