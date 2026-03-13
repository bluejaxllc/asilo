require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const users = await db.user.findMany({ select: { email: true } });
    console.log("=== USERS IN PROD DB ===");
    users.forEach(u => console.log(u.email));
    console.log("========================");
}

main().finally(() => db.$disconnect());
