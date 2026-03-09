import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("Hashing new password...");
    // The user wants '123456' as their password
    const hashedPassword = await bcrypt.hash("123456", 10);

    const usersToUpdate = ["edgar@bluejax.ai", "contact@bluejax.ai"];

    for (const email of usersToUpdate) {
        try {
            const user = await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });
            console.log(`Updated password for Verified User: ${user.email}`);
        } catch (e) {
            if (e instanceof Error) {
                console.log(`Could not update User ${email}. Maybe it doesn't exist. Error:`, e.message);
            } else {
                console.log(`Could not update User ${email}. Maybe it doesn't exist. Error:`, e);
            }
        }

        try {
            const pending = await prisma.pendingRegistration.update({
                where: { email },
                data: { hashedPassword }
            });
            console.log(`Updated password for Pending User: ${pending.email}`);
        } catch (e) {
            console.log(`Could not update Pending ${email}. Maybe it doesn't exist.`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
