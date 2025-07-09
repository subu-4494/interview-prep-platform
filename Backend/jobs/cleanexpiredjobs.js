import cron from 'node-cron';
import Slot from '../models/slot.js';

export const startCleanupExpiredSlotsJob = () => {
  cron.schedule('0 * * * *', async () => {
    const now = new Date();
    try {
      const { deletedCount } = await Slot.deleteMany({ endTime: { $lt: now } });
      if (deletedCount > 0) {
        console.log(` ${deletedCount} expired slots deleted at ${now.toISOString()}`);
      } else {
        console.log(` No expired slots found at ${now.toISOString()}`);
      }
    } catch (err) {
      console.error(` Error cleaning up slots at ${now.toISOString()}:`, err.message);
    }
  }, {
    timezone: 'UTC', 
  });

  console.log(' Expired slots cleanup cron job scheduled (every hour)');
};
