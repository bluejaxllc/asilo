require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const users = await db.user.findMany({ select: { id: true, email: true, name: true, role: true } });
    console.log(JSON.stringify(users, null, 2));
}

main().finally(() => db.$disconnect());
