import { config } from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function addMentorTables() {
  console.log('🔄 Adding mentor tables to database...');

  try {
    await pool.query('BEGIN');

    // Add role column to existing users table
    console.log('Adding role column to users table...');
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('admin', 'mentor', 'student')),
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `);

    // Create mentors table
    console.log('Creating mentors table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentors (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        github_username VARCHAR(255),
        expertise TEXT[],
        bio TEXT,
        max_mentees INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add mentor_id to students table
    console.log('Adding mentor_id to students table...');
    await pool.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS mentor_id INTEGER REFERENCES mentors(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL
    `);

    // Create mentor_student_assignments table for tracking history
    console.log('Creating mentor_student_assignments table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentor_student_assignments (
        id SERIAL PRIMARY KEY,
        mentor_id INTEGER REFERENCES mentors(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unassigned_at TIMESTAMP,
        reason TEXT,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(mentor_id, student_id, is_active)
      )
    `);

    // Create mentor_feedback table
    console.log('Creating mentor_feedback table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentor_feedback (
        id SERIAL PRIMARY KEY,
        mentor_id INTEGER REFERENCES mentors(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        contribution_id INTEGER REFERENCES contributions(id) ON DELETE CASCADE,
        feedback_type VARCHAR(50) CHECK (feedback_type IN ('code_review', 'general', 'encouragement', 'improvement')),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create mentor_goals table
    console.log('Creating mentor_goals table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentor_goals (
        id SERIAL PRIMARY KEY,
        mentor_id INTEGER REFERENCES mentors(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_date DATE,
        status VARCHAR(50) CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')) DEFAULT 'not_started',
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table for tracking login sessions
    console.log('Creating sessions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    console.log('Creating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_students_mentor_id ON students(mentor_id);
      CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id);
      CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor ON mentor_student_assignments(mentor_id);
      CREATE INDEX IF NOT EXISTS idx_mentor_assignments_student ON mentor_student_assignments(student_id);
      CREATE INDEX IF NOT EXISTS idx_mentor_feedback_mentor ON mentor_feedback(mentor_id);
      CREATE INDEX IF NOT EXISTS idx_mentor_feedback_student ON mentor_feedback(student_id);
      CREATE INDEX IF NOT EXISTS idx_mentor_goals_mentor ON mentor_goals(mentor_id);
      CREATE INDEX IF NOT EXISTS idx_mentor_goals_student ON mentor_goals(student_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    `);

    // Insert default admin user (password: admin123 - should be changed immediately)
    console.log('Creating default admin user...');
    const adminEmail = 'admin@ostracker.local';
    const adminPassword = '$2b$10$XK.3jKr5KznFeYcUwKnAUe6Mz1J5.GNPYGhJvO5JhYpGKVMq5Qohi'; // bcrypt hash of 'admin123'

    // Check if admin already exists
    const existingAdmin = await pool.query(`
      SELECT id FROM users WHERE email = $1
    `, [adminEmail]);

    if (existingAdmin.rows.length === 0) {
      await pool.query(`
        INSERT INTO users (id, email, password_hash, role, auth_id, stack_user_id, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, 'admin', 'local-admin', 'admin', NOW(), NOW())
      `, [adminEmail, adminPassword]);
      console.log('✅ Default admin user created');
    } else {
      // Update existing user to have admin role and password
      await pool.query(`
        UPDATE users
        SET role = 'admin', password_hash = $2
        WHERE email = $1
      `, [adminEmail, adminPassword]);
      console.log('✅ Existing admin user updated');
    }

    await pool.query('COMMIT');

    console.log('✅ Mentor tables added successfully!');
    console.log('');
    console.log('📝 Default admin credentials:');
    console.log('   Email: admin@ostracker.local');
    console.log('   Password: admin123');
    console.log('   ⚠️  Please change the password immediately after first login!');

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error adding mentor tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  addMentorTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default addMentorTables;