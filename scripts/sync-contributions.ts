import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { pool, initDatabase } from '../lib/db';
import { syncRepository } from '../lib/sync';

async function syncAllRepositories() {
  try {
    // Initialize database if needed
    await initDatabase();

    // Get all repositories that need syncing
    const result = await pool.query(`
      SELECT r.id, r.owner, r.name, s.github_username
      FROM repositories r
      JOIN students s ON r.student_id = s.id
      ORDER BY r.id
    `);

    console.log(`Found ${result.rows.length} repositories to sync`);

    for (const repo of result.rows) {
      console.log(`Syncing ${repo.owner}/${repo.name} for ${repo.github_username}...`);
      const syncResult = await syncRepository(
        repo.id,
        repo.github_username,
        repo.owner,
        repo.name
      );
      
      if (syncResult.success) {
        console.log(`✓ Synced ${syncResult.contributions_count} contributions`);
      } else {
        console.error(`✗ Failed: ${syncResult.error}`);
      }
    }

    console.log('Sync completed!');
    process.exit(0);
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

syncAllRepositories();
