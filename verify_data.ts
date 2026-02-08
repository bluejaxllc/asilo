import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const users = await prisma.user.count()
        const patients = await prisma.patient.count()
        const tasks = await prisma.task.count()
        const logs = await prisma.dailyLog.count()
        const meds = await prisma.medication.count()

        console.log('--- VERIFICATION RESULTS ---')
        console.log(`Users: ${users}`)
        console.log(`Patients: ${patients}`)
        console.log(`Tasks: ${tasks}`)
        console.log(`DailyLogs: ${logs}`)
        console.log(`Medications: ${meds}`)
        console.log('----------------------------')

        if (patients < 10) throw new Error("Patients count too low!");
        if (tasks < 10) throw new Error("Tasks count too low!");

    } catch (e) {
        console.error("Verification failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
