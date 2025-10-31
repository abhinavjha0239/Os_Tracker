import { Pool } from 'pg';
import { config } from 'dotenv';

// Load .env.local if not already loaded (for scripts)
if (typeof window === 'undefined' && !process.env.DATABASE_URL) {
  config({ path: '.env.local' });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database schema
export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Drop existing tables if they exist (for clean setup)
    // Comment out these DROP statements if you want to preserve existing data
    await client.query(`DROP TABLE IF EXISTS sync_logs CASCADE`);
    await client.query(`DROP TABLE IF EXISTS contributions CASCADE`);
    await client.query(`DROP TABLE IF EXISTS repositories CASCADE`);
    await client.query(`DROP TABLE IF EXISTS organizations CASCADE`);
    await client.query(`DROP TABLE IF EXISTS students CASCADE`);

    // Create students table
    await client.query(`
      CREATE TABLE students (
        id SERIAL PRIMARY KEY,
        github_username VARCHAR(255) UNIQUE NOT NULL,
        student_name VARCHAR(255),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create organizations table
    await client.query(`
      CREATE TABLE organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        github_org_name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create repositories table
    await client.query(`
      CREATE TABLE repositories (
        id SERIAL PRIMARY KEY,
        owner VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        full_name VARCHAR(500) NOT NULL,
        organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
        is_organization_repo BOOLEAN DEFAULT FALSE,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, owner, name)
      )
    `);

    // Create contributions table
    await client.query(`
      CREATE TABLE contributions (
        id SERIAL PRIMARY KEY,
        repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('commit', 'pull_request', 'issue')),
        external_id VARCHAR(255) NOT NULL,
        title TEXT,
        url TEXT NOT NULL,
        state VARCHAR(50),
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        metadata JSONB,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(repository_id, type, external_id)
      )
    `);

    // Create sync_logs table for tracking sync operations
    await client.query(`
      CREATE TABLE sync_logs (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'error', 'partial')),
        contributions_count INTEGER DEFAULT 0,
        error_message TEXT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_repositories_student_id ON repositories(student_id);
      CREATE INDEX IF NOT EXISTS idx_repositories_org_id ON repositories(organization_id);
      CREATE INDEX IF NOT EXISTS idx_contributions_repository_id ON contributions(repository_id);
      CREATE INDEX IF NOT EXISTS idx_contributions_student_id ON contributions(student_id);
      CREATE INDEX IF NOT EXISTS idx_contributions_type ON contributions(type);
      CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON contributions(created_at);
      CREATE INDEX IF NOT EXISTS idx_sync_logs_student_id ON sync_logs(student_id);
      CREATE INDEX IF NOT EXISTS idx_sync_logs_repository_id ON sync_logs(repository_id);
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}
