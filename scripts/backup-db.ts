import { config } from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupDir = path.join(process.cwd(), 'backups');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

  try {
    // Create backups directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true });

    console.log('🔄 Starting database backup...');
    console.log(`📁 Backup file: ${backupFile}`);

    const backup: any = {
      timestamp: new Date().toISOString(),
      database_url: process.env.DATABASE_URL?.substring(0, 30) + '...',
      tables: {}
    };

    // Backup each table
    const tables = ['students', 'organizations', 'repositories', 'contributions', 'sync_logs'];

    for (const table of tables) {
      console.log(`  📊 Backing up ${table}...`);
      const result = await pool.query(`SELECT * FROM ${table}`);
      backup.tables[table] = {
        row_count: result.rowCount,
        data: result.rows
      };
      console.log(`     ✅ ${result.rowCount} rows backed up`);
    }

    // Write backup to file
    await fs.writeFile(backupFile, JSON.stringify(backup, null, 2));

    console.log('\n✅ Database backup completed successfully!');
    console.log(`📁 Backup saved to: ${backupFile}`);
    console.log(`📊 Total size: ${(await fs.stat(backupFile)).size / 1024}KB`);

    // List recent backups
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));
    console.log(`\n📚 Total backups available: ${backupFiles.length}`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    await pool.end();
    process.exit(1);
  }
}

// Add command line arguments support
if (process.argv.includes('--help')) {
  console.log(`
Database Backup Script
======================

Usage: npm run backup

This script creates a JSON backup of all database tables.
Backups are stored in the /backups directory with timestamps.

Environment Variables Required:
- DATABASE_URL: PostgreSQL connection string

Options:
  --help    Show this help message
  `);
  process.exit(0);
}

backupDatabase();