import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, emailVerified: true }
    });

    const pending = await prisma.pendingRegistration.findMany({
        select: { id: true, name: true, email: true, role: true }
    });

    fs.writeFileSync('db_out.json', JSON.stringify({ users, pending }, null, 2), 'utf8');
}

main().catch(console.error).finally(() => prisma.$disconnect());
