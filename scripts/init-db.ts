// Load environment variables FIRST, before any other imports
import { config } from 'dotenv';
import { resolve } from 'path';
import readline from 'readline';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Now import after dotenv is configured
import { initDatabase } from '../lib/db';

// Create readline interface for user input
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

async function main() {
  try {
    // Check if running in production
    const isProduction = process.env.NODE_ENV === 'production' ||
                        process.env.VERCEL_ENV === 'production' ||
                        process.env.DATABASE_URL?.includes('neon.tech');

    console.log('\n⚠️  WARNING: Database Initialization ⚠️');
    console.log('=====================================');
    console.log('This script will DROP ALL TABLES and DELETE ALL DATA!');
    console.log('');

    if (isProduction) {
      console.log('🚨 PRODUCTION DATABASE DETECTED! 🚨');
      console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');
      console.log('');
      console.log('This will DELETE ALL PRODUCTION DATA!');
      console.log('');

      const answer = await askQuestion('Are you ABSOLUTELY SURE? Type "DELETE PRODUCTION DATA" to continue: ');

      if (answer !== 'DELETE PRODUCTION DATA') {
        console.log('❌ Initialization cancelled. Production data is safe.');
        process.exit(0);
      }

      const confirm = await askQuestion('Last chance! Type "YES" to confirm deletion of ALL PRODUCTION DATA: ');

      if (confirm !== 'YES') {
        console.log('❌ Initialization cancelled. Production data is safe.');
        process.exit(0);
      }
    } else {
      console.log('Environment: Development/Testing');
      console.log('');
      const answer = await askQuestion('Type "yes" to continue with database initialization: ');

      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Initialization cancelled.');
        process.exit(0);
      }
    }

    console.log('\n🔄 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized successfully!');
    console.log('⚠️  All previous data has been deleted.');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    rl.close();
    process.exit(1);
  }
}

main();
