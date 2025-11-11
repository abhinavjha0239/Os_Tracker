import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { Organization } from '@/lib/db-types';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        o.*,
        COUNT(DISTINCT r.student_id) as student_count,
        COUNT(DISTINCT r.id) as repo_count,
        COUNT(DISTINCT c.id) FILTER (WHERE c.type = 'pull_request' AND c.state = 'merged') as merged_prs_count
      FROM organizations o
      LEFT JOIN repositories r ON r.organization_id = o.id
      LEFT JOIN contributions c ON c.repository_id = r.id
      GROUP BY o.id
      ORDER BY o.name
    `);
    
    const organizations = result.rows.map((row: any) => ({
      ...row,
      student_count: parseInt(row.student_count) || 0,
      repo_count: parseInt(row.repo_count) || 0,
      merged_prs_count: parseInt(row.merged_prs_count) || 0
    }));
    
    return NextResponse.json({ organizations });
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, github_org_name } = body;

    if (!name || !github_org_name) {
      return NextResponse.json(
        { error: 'Name and GitHub organization name are required' },
        { status: 400 }
      );
    }

    const result = await pool.query<Organization>(
      `INSERT INTO organizations (name, github_org_name)
       VALUES ($1, $2)
       RETURNING *`,
      [name, github_org_name]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Organization already exists' },
        { status: 409 }
      );
    }
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
