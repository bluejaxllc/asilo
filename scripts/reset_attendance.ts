import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const user = await prisma.user.findUnique({ where: { email: 'staff@asilo.com' } });
        if (!user) throw new Error("User not found");

        const deleted = await prisma.attendance.deleteMany({
            where: {
                userId: user.id
            }
        });

        console.log(`Deleted ${deleted.count} attendance records for staff@asilo.com`);

    } catch (e) {
        console.error("Reset failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
