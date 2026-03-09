import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Patients:', await prisma.patient.count());
    console.log('Tasks:', await prisma.task.count());
    console.log('Medications:', await prisma.medication.count());
    console.log('Daily Logs:', await prisma.dailyLog.count());
}

main().catch(console.error).finally(() => prisma.$disconnect());
