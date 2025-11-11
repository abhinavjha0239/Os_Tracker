import { config } from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function restoreDatabase() {
  try {
    const backupDir = path.join(process.cwd(), 'backups');

    // List available backups
    console.log('📚 Available backups:');
    const files = await fs.readdir(backupDir).catch(() => []);
    const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json')).sort().reverse();

    if (backupFiles.length === 0) {
      console.log('❌ No backup files found in /backups directory');
      process.exit(1);
    }

    backupFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });

    const choice = await askQuestion('\nEnter the number of the backup to restore (or filename): ');
    let backupFile: string;

    if (/^\d+$/.test(choice)) {
      const index = parseInt(choice) - 1;
      if (index < 0 || index >= backupFiles.length) {
        console.log('❌ Invalid selection');
        process.exit(1);
      }
      backupFile = path.join(backupDir, backupFiles[index]);
    } else {
      backupFile = path.join(backupDir, choice);
    }

    // Load backup file
    console.log(`\n📂 Loading backup from: ${backupFile}`);
    const backupData = JSON.parse(await fs.readFile(backupFile, 'utf-8'));

    console.log('\n⚠️  WARNING: Database Restore ⚠️');
    console.log('=====================================');
    console.log(`Backup timestamp: ${backupData.timestamp}`);
    console.log('This will REPLACE ALL CURRENT DATA with the backup!');
    console.log('\nTables to restore:');

    for (const [table, data] of Object.entries(backupData.tables as Record<string, any>)) {
      console.log(`  - ${table}: ${data.row_count} rows`);
    }

    const confirm = await askQuestion('\nType "RESTORE" to continue: ');
    if (confirm !== 'RESTORE') {
      console.log('❌ Restore cancelled');
      rl.close();
      process.exit(0);
    }

    console.log('\n🔄 Starting restore...');

    // Begin transaction
    await pool.query('BEGIN');

    try {
      // Disable foreign key checks temporarily
      await pool.query('SET session_replication_role = replica');

      // Clear existing data in reverse order of dependencies
      const tablesToClear = ['sync_logs', 'contributions', 'repositories', 'organizations', 'students'];
      for (const table of tablesToClear) {
        console.log(`  🗑️  Clearing ${table}...`);
        await pool.query(`DELETE FROM ${table}`);
      }

      // Restore data in order of dependencies
      const tablesToRestore = ['students', 'organizations', 'repositories', 'contributions', 'sync_logs'];
      for (const table of tablesToRestore) {
        const tableData = backupData.tables[table];
        if (!tableData || !tableData.data || tableData.data.length === 0) {
          console.log(`  ⏭️  Skipping ${table} (no data)`);
          continue;
        }

        console.log(`  📥 Restoring ${table} (${tableData.data.length} rows)...`);

        for (const row of tableData.data) {
          const columns = Object.keys(row);
          const values = Object.values(row);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

          const query = `
            INSERT INTO ${table} (${columns.join(', ')})
            VALUES (${placeholders})
          `;

          await pool.query(query, values);
        }

        console.log(`     ✅ ${table} restored`);
      }

      // Re-enable foreign key checks
      await pool.query('SET session_replication_role = DEFAULT');

      // Commit transaction
      await pool.query('COMMIT');

      console.log('\n✅ Database restored successfully!');

      // Verify restoration
      console.log('\n📊 Verification:');
      for (const table of tablesToRestore) {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  - ${table}: ${result.rows[0].count} rows`);
      }

    } catch (error) {
      console.error('❌ Restore failed, rolling back:', error);
      await pool.query('ROLLBACK');
      throw error;
    }

    rl.close();
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Restore failed:', error);
    rl.close();
    await pool.end();
    process.exit(1);
  }
}

// Add command line arguments support
if (process.argv.includes('--help')) {
  console.log(`
Database Restore Script
=======================

Usage: npm run restore

This script restores database from a JSON backup file.
It will prompt you to select from available backups.

WARNING: This will REPLACE all current data!

Environment Variables Required:
- DATABASE_URL: PostgreSQL connection string

Options:
  --help    Show this help message
  `);
  process.exit(0);
}

restoreDatabase();