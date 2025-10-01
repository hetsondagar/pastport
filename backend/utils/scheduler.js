import cron from 'cron';
import Capsule from '../models/Capsule.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendEmail, emailTemplates } from './emailService.js';

// Check for capsules ready to unlock (runs every hour)
const unlockCheckJob = new cron.CronJob('0 * * * *', async () => {
  try {
    console.log('Checking for capsules ready to unlock...');
    
    const now = new Date();
    const readyCapsules = await Capsule.find({
      isUnlocked: false,
      unlockDate: { $lte: now }
    }).populate('creator', 'name email preferences');

    for (const capsule of readyCapsules) {
      // Create notification for creator
      await Notification.createNotification(
        capsule.creator._id,
        'capsule_unlocked',
        'Capsule Ready to Unlock!',
        `Your capsule "${capsule.title}" is ready to be unlocked!`,
        { capsuleId: capsule._id }
      );

      // Send email reminder if user has email notifications enabled
      if (capsule.creator.preferences.notifications.email && 
          capsule.creator.preferences.notifications.unlockReminders) {
        const template = emailTemplates.unlockReminder(
          capsule.creator.name,
          capsule.title,
          capsule.unlockDate
        );
        
        await sendEmail(capsule.creator.email, template.subject, template.html, template.text);
      }
    }

    if (readyCapsules.length > 0) {
      console.log(`Found ${readyCapsules.length} capsules ready to unlock`);
    }
  } catch (error) {
    console.error('Error in unlock check job:', error);
  }
});

// Send unlock reminders (runs daily at 9 AM)
const reminderJob = new cron.CronJob('0 9 * * *', async () => {
  try {
    console.log('Sending unlock reminders...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const upcomingCapsules = await Capsule.find({
      isUnlocked: false,
      unlockDate: { $gte: tomorrow, $lt: dayAfter }
    }).populate('creator', 'name email preferences');

    for (const capsule of upcomingCapsules) {
      if (capsule.creator.preferences.notifications.email && 
          capsule.creator.preferences.notifications.unlockReminders) {
        const template = emailTemplates.unlockReminder(
          capsule.creator.name,
          capsule.title,
          capsule.unlockDate
        );
        
        await sendEmail(capsule.creator.email, template.subject, template.html, template.text);
      }
    }

    if (upcomingCapsules.length > 0) {
      console.log(`Sent ${upcomingCapsules.length} unlock reminders`);
    }
  } catch (error) {
    console.error('Error in reminder job:', error);
  }
});

// Clean up expired notifications (runs daily at midnight)
const cleanupJob = new cron.CronJob('0 0 * * *', async () => {
  try {
    console.log('Cleaning up expired notifications...');
    
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    }
  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
});

// Start all cron jobs
export const startScheduler = () => {
  unlockCheckJob.start();
  reminderJob.start();
  cleanupJob.start();
  console.log('📅 Scheduler started - Cron jobs are running');
};

// Stop all cron jobs
export const stopScheduler = () => {
  unlockCheckJob.stop();
  reminderJob.stop();
  cleanupJob.stop();
  console.log('📅 Scheduler stopped');
};

export default { startScheduler, stopScheduler };
