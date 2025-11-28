const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const initScheduler = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        console.log('Checking for due medicines...');

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
                    user: true,
                    medicine: true
                }
            });

            for (const schedule of dueSchedules) {
                // Trigger Notification
                console.log(`[REMINDER] Hey ${schedule.user.name}, it's time to take your ${schedule.medicine.name} (${schedule.medicine.dosage})!`);

                // Mark as NOTIFIED (if we had such a status) or just log it
                // For now, we keep it PENDING until the user marks it as TAKEN via API
            }
        } catch (error) {
            console.error('Scheduler Error:', error);
        }
    });
};

module.exports = initScheduler;
