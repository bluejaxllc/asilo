import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Upgrading admin@asilo.com to SUPER_ADMIN...");

    const user = await prisma.user.update({
        where: { email: 'admin@asilo.com' },
        data: { role: 'SUPER_ADMIN' }
    });

    console.log(`Success! ${user.email} is now a ${user.role}.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
