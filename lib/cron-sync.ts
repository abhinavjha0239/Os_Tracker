import { pool, initDatabase } from './db';
import { syncRepository } from './sync';

export async function syncAllRepositories() {
  try {
    // Initialize database if needed
    await initDatabase();

    // Get all repositories
    const result = await pool.query(`
      SELECT r.id, r.owner, r.name, s.github_username
      FROM repositories r
      JOIN students s ON r.student_id = s.id
      ORDER BY r.id
    `);

    console.log(`[${new Date().toISOString()}] Found ${result.rows.length} repositories to sync`);

    const results = [];
    for (const repo of result.rows) {
      try {
        console.log(`Syncing ${repo.owner}/${repo.name} for ${repo.github_username}...`);
        const syncResult = await syncRepository(
          repo.id,
          repo.github_username,
          repo.owner,
          repo.name
        );
        results.push({
          repository: `${repo.owner}/${repo.name}`,
          ...syncResult,
        });
      } catch (error: any) {
        console.error(`Error syncing ${repo.owner}/${repo.name}:`, error.message);
        results.push({
          repository: `${repo.owner}/${repo.name}`,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`[${new Date().toISOString()}] Sync completed: ${successCount}/${result.rows.length} successful`);

    return results;
  } catch (error: any) {
    console.error('Sync failed:', error);
    throw error;
  }
}
