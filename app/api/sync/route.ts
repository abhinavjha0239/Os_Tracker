import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { syncRepository } from '@/lib/sync';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repository_id, student_id } = body;

    if (!repository_id && !student_id) {
      return NextResponse.json(
        { error: 'Either repository_id or student_id is required' },
        { status: 400 }
      );
    }

    let repositories: Array<{ id: number; owner: string; name: string; student_id: number }>;

    if (repository_id) {
      const repoResult = await pool.query(
        `SELECT id, owner, name, student_id FROM repositories WHERE id = $1`,
        [repository_id]
      );
      repositories = repoResult.rows;
    } else {
      // Find all repositories associated with this student (owned by them OR they have contributions)
      const reposResult = await pool.query(
        `SELECT DISTINCT r.id, r.owner, r.name, r.student_id
         FROM repositories r
         WHERE r.student_id = $1
         UNION
         SELECT DISTINCT r.id, r.owner, r.name, r.student_id
         FROM contributions c
         JOIN repositories r ON c.repository_id = r.id
         WHERE c.student_id = $1`,
        [student_id]
      );
      repositories = reposResult.rows;
    }

    if (repositories.length === 0) {
      return NextResponse.json(
        { error: 'No repositories found' },
        { status: 404 }
      );
    }

    // Get the student's GitHub username for syncing
    let syncUsername: string | null = null;
    if (student_id) {
      const studentResult = await pool.query(
        `SELECT github_username FROM students WHERE id = $1`,
        [student_id]
      );
      syncUsername = studentResult.rows[0]?.github_username || null;
    }

    if (!syncUsername && student_id) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const results = [];
    for (const repo of repositories) {
      // Use the student's GitHub username for syncing (not the repo owner's)
      const username = syncUsername || (await pool.query(
        `SELECT github_username FROM students WHERE id = $1`,
        [repo.student_id]
      )).rows[0]?.github_username;

      if (username) {
        const syncResult = await syncRepository(
          repo.id,
          username,
          repo.owner,
          repo.name
        );
        results.push({
          repository_id: repo.id,
          ...syncResult,
        });
      }
    }

    return NextResponse.json({
      message: 'Sync completed',
      results,
    });
  } catch (error: any) {
    console.error('Error syncing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync' },
      { status: 500 }
    );
  }
}
