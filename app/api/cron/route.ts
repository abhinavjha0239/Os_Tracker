import { NextRequest, NextResponse } from 'next/server';
import { syncAllRepositories } from '@/lib/cron-sync';

// This endpoint can be called by a cron service like Vercel Cron
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  // Simple auth check - in production use a secure token
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await syncAllRepositories();
    return NextResponse.json({ message: 'Sync completed successfully' });
  } catch (error: any) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
