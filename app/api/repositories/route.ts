import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { parseRepoUrl } from '@/lib/github';
import { Repository } from '@/lib/db-types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const studentId = searchParams.get('studentId');
  const organizationId = searchParams.get('organization_id');

  try {
    let query = `
      SELECT 
        r.*,
        o.name as organization_name, 
        o.github_org_name,
        s.github_username as student_username,
        s.student_name
      FROM repositories r
      LEFT JOIN organizations o ON r.organization_id = o.id
      LEFT JOIN students s ON r.student_id = s.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (studentId) {
      conditions.push(`r.student_id = $${params.length + 1}`);
      params.push(studentId);
    }

    if (organizationId) {
      conditions.push(`r.organization_id = $${params.length + 1}`);
      params.push(organizationId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, repo_url, organization_id } = body;

    if (!student_id || !repo_url) {
      return NextResponse.json(
        { error: 'Student ID and repository URL are required' },
        { status: 400 }
      );
    }

    const parsed = parseRepoUrl(repo_url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid repository URL format' },
        { status: 400 }
      );
    }

    const fullName = `${parsed.owner}/${parsed.name}`;
    const isOrgRepo = organization_id ? true : false;

    const result = await pool.query<Repository>(
      `INSERT INTO repositories (owner, name, full_name, organization_id, is_organization_repo, student_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [parsed.owner, parsed.name, fullName, organization_id || null, isOrgRepo, student_id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Repository already exists for this student' },
        { status: 409 }
      );
    }
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Student or organization not found' },
        { status: 404 }
      );
    }
    console.error('Error creating repository:', error);
    return NextResponse.json(
      { error: 'Failed to create repository' },
      { status: 500 }
    );
  }
}
