import cron from 'node-cron';
import { syncAllRepositories } from './cron-sync';

// Run daily at 2 AM
export function startDailySync() {
  cron.schedule('0 2 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Starting daily sync...`);
    try {
      await syncAllRepositories();
      console.log(`[${new Date().toISOString()}] Daily sync completed`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Daily sync failed:`, error);
    }
  });
  console.log('Daily sync job scheduled (runs at 2 AM daily)');
}
