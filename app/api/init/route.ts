import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { initDatabase } from '@/lib/db';

// CRITICAL: This endpoint can DROP ALL TABLES
// Protected with authentication and environment checks
export async function GET(request: NextRequest) {
  try {
    // 1. Check for authentication token
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_INIT_TOKEN;

    if (!adminToken) {
      console.error('ADMIN_INIT_TOKEN not configured - database init disabled for safety');
      return NextResponse.json(
        { error: 'Database initialization is disabled. Set ADMIN_INIT_TOKEN to enable.' },
        { status: 503 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authentication token' },
        { status: 401 }
      );
    }

    // 2. Prevent running in production unless explicitly allowed
    const isProduction = process.env.NODE_ENV === 'production' ||
                        process.env.VERCEL_ENV === 'production';
    const allowProductionInit = process.env.ALLOW_PRODUCTION_INIT === 'true';

    if (isProduction && !allowProductionInit) {
      return NextResponse.json(
        {
          error: 'Database initialization is disabled in production. ' +
                 'Set ALLOW_PRODUCTION_INIT=true to override (DANGEROUS!)'
        },
        { status: 403 }
      );
    }

    // 3. Log the initialization attempt
    console.warn('⚠️ DATABASE INITIALIZATION REQUESTED ⚠️');
    console.warn('Environment:', process.env.NODE_ENV);
    console.warn('Timestamp:', new Date().toISOString());
    console.warn('This will DROP ALL TABLES and DELETE ALL DATA!');

    // 4. Execute initialization
    await initDatabase();

    return NextResponse.json({
      message: 'Database initialized successfully',
      warning: 'All previous data has been deleted',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
