import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const lastAttendance = await prisma.attendance.findFirst({
            where: {
                user: { email: 'staff@asilo.com' }
            },
            orderBy: { checkIn: 'desc' },
            include: { user: true }
        })

        console.log('--- LATEST ATTENDANCE ---')
        if (lastAttendance) {
            console.log(`User: ${lastAttendance.user.email}`)
            console.log(`CheckIn: ${lastAttendance.checkIn}`)
            console.log(`CheckOut: ${lastAttendance.checkOut}`)
            console.log(`Is Active: ${!lastAttendance.checkOut}`)
        } else {
            console.log('No attendance records found for staff@asilo.com')
        }
        console.log('-------------------------')

    } catch (e) {
        console.error("Verification failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
