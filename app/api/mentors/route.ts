import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// GET - Fetch all mentors with enhanced data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // active, inactive, all
    const expertise = searchParams.get('expertise');
    const available = searchParams.get('available'); // true to get only available mentors

    let query = `
      SELECT
        m.*,
        COUNT(DISTINCT msa.student_id) AS current_mentees,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.student_name,
              'github_username', s.github_username,
              'merged_prs_count', s.merged_prs_count
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) AS mentees,
        COUNT(DISTINCT mf.id) AS total_feedback_given,
        COUNT(DISTINCT mg.id) FILTER (WHERE mg.status = 'completed') AS goals_completed,
        AVG(CASE WHEN mf.created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) * 100 AS activity_rate
      FROM mentors m
      LEFT JOIN mentor_student_assignments msa
        ON m.id = msa.mentor_id
        AND msa.is_active = true
      LEFT JOIN students s
        ON msa.student_id = s.id
      LEFT JOIN mentor_feedback mf
        ON m.id = mf.mentor_id
      LEFT JOIN mentor_goals mg
        ON m.id = mg.mentor_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    // Add filters
    if (status === 'active') {
      query += ' AND m.is_active = true';
    } else if (status === 'inactive') {
      query += ' AND m.is_active = false';
    }

    if (expertise) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(m.expertise)`;
      params.push(expertise);
    }

    if (available === 'true') {
      query += ' AND m.is_active = true';
      query += ' HAVING COUNT(DISTINCT msa.student_id) < m.max_mentees';
    }

    query += `
      GROUP BY m.id
      ORDER BY m.is_active DESC, m.created_at DESC
    `;

    const result = await pool.query(query, params);

    // Calculate additional metrics
    const mentors = result.rows.map(mentor => ({
      ...mentor,
      availability_status: mentor.current_mentees < mentor.max_mentees ? 'available' : 'full',
      capacity_percentage: Math.round((mentor.current_mentees / mentor.max_mentees) * 100),
      is_highly_active: mentor.activity_rate > 70,
    }));

    return NextResponse.json({
      mentors,
      total: mentors.length,
      active: mentors.filter(m => m.is_active).length,
      available: mentors.filter(m => m.availability_status === 'available').length,
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json({ error: 'Failed to fetch mentors' }, { status: 500 });
  }
}

// POST - Create a new mentor with enhanced validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      github_username,
      expertise,
      bio,
      max_mentees,
      is_active,
      linkedin_url,
      twitter_url,
      availability_hours,
      timezone,
      languages,
      mentoring_areas,
      years_of_experience,
      company,
      password
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate max_mentees
    if (max_mentees && (max_mentees < 1 || max_mentees > 50)) {
      return NextResponse.json({ error: 'Max mentees must be between 1 and 50' }, { status: 400 });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create user account if password is provided
      let userId = null;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await client.query(
          `INSERT INTO users (id, email, password_hash, role, auth_id, stack_user_id, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, 'mentor', $3, $4, NOW(), NOW())
           RETURNING id`,
          [email, hashedPassword, `mentor-${email}`, `mentor-${Date.now()}`]
        );
        userId = userResult.rows[0].id;
      }

      // Create mentor profile
      const result = await client.query(
        `INSERT INTO mentors (
          user_id, name, email, github_username, expertise, bio, max_mentees, is_active,
          linkedin_url, twitter_url, availability_hours, timezone, languages,
          mentoring_areas, years_of_experience, company
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [
          userId,
          name,
          email,
          github_username,
          expertise || [],
          bio,
          max_mentees || 10,
          is_active !== false,
          linkedin_url,
          twitter_url,
          availability_hours,
          timezone || 'UTC',
          languages || ['English'],
          mentoring_areas || [],
          years_of_experience,
          company
        ]
      );

      await client.query('COMMIT');

      // Send welcome email (in production, use a proper email service)
      // await sendWelcomeEmail(email, name);

      return NextResponse.json({
        mentor: result.rows[0],
        message: 'Mentor created successfully',
        hasAccount: !!password
      }, { status: 201 });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Error creating mentor:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A mentor with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create mentor' }, { status: 500 });
  }
}

// PUT - Bulk update mentors (e.g., deactivate multiple)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentorIds, updates } = body;

    if (!mentorIds || !Array.isArray(mentorIds) || mentorIds.length === 0) {
      return NextResponse.json({ error: 'Mentor IDs are required' }, { status: 400 });
    }

    const allowedUpdates = ['is_active', 'max_mentees'];
    const updateClauses = [];
    const params = [mentorIds];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        paramCount++;
        updateClauses.push(`${key} = $${paramCount}`);
        params.push(value);
      }
    }

    if (updateClauses.length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    const query = `
      UPDATE mentors
      SET ${updateClauses.join(', ')}, updated_at = NOW()
      WHERE id = ANY($1::int[])
      RETURNING id, name, is_active
    `;

    const result = await pool.query(query, params);

    return NextResponse.json({
      updated: result.rows,
      count: result.rowCount
    });

  } catch (error) {
    console.error('Error updating mentors:', error);
    return NextResponse.json({ error: 'Failed to update mentors' }, { status: 500 });
  }
}