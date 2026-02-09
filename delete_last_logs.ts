import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteLastLogs() {
    try {
        // Get the last 4 logs by creation date
        const lastLogs = await prisma.dailyLog.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 4
        });

        console.log('Logs to delete:');
        lastLogs.forEach(log => {
            console.log(`- ID: ${log.id}, Type: ${log.type}, Value: ${log.value}, Created: ${log.createdAt}`);
        });

        const ids = lastLogs.map(log => log.id);

        // Delete them
        const result = await prisma.dailyLog.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        console.log(`\n✅ Successfully deleted ${result.count} log entries`);
    } catch (error) {
        console.error('Error deleting logs:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteLastLogs();
