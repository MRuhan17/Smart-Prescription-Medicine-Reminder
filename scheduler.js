const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const initScheduler = () => {
    console.log('Initializing medication reminder scheduler...');
    
    // Validate cron expression before scheduling
    const cronExpression = '* * * * *'; // Run every minute
    if (!cron.validate(cronExpression)) {
        console.error('Invalid cron expression');
        return;
    }

    // Run every minute
    const task = cron.schedule(cronExpression, async () => {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

        try {
            // Find pending schedules due in the past 5 minutes (to catch any slightly missed ones)
            // In a real app, you'd be more precise or use a queue
            const dueSchedules = await prisma.schedule.findMany({
                where: {
                    status: 'PENDING',
                    time: {
                        lte: now,
                        gte: fiveMinutesAgo
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    medicine: {
                        select: {
                            id: true,
                            name: true,
                            dosage: true
                        }
                    }
                }
            });

            if (dueSchedules.length > 0) {
                console.log(`[${now.toISOString()}] Found ${dueSchedules.length} due medication reminders`);
            }

            for (const schedule of dueSchedules) {
                // Trigger Notification
                console.log(`[REMINDER] Hey ${schedule.user.name}, it's time to take your ${schedule.medicine.name} (${schedule.medicine.dosage})!`);

                // In production, send actual notification (push notification, email, SMS)
                // await sendPushNotification(schedule.user, schedule.medicine);
                
                // Mark as NOTIFIED (if we had such a status) or just log it
                // For now, we keep it PENDING until the user marks it as TAKEN via API
            }
        } catch (error) {
            console.error('Scheduler Error:', error.message);
        }
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
        console.log('Stopping scheduler due to SIGTERM...');
        task.stop();
        prisma.$disconnect();
    });

    process.on('SIGINT', () => {
        console.log('Stopping scheduler due to SIGINT...');
        task.stop();
        prisma.$disconnect();
    });

    console.log('Medication reminder scheduler started successfully');
};

module.exports = initScheduler;
