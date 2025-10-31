import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { Organization } from '@/lib/db-types';

export async function GET() {
  try {
    const result = await pool.query<Organization>(
      `SELECT * FROM organizations ORDER BY name`
    );
    return NextResponse.json(result.rows);
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
