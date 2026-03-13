require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const users = await db.user.findMany({ select: { email: true, id: true, facilityId: true } });
    const facilities = await db.facility.findMany({ select: { id: true, name: true } });
    const result = { totalUsers: users.length, users: users.map(u => u.email), totalFacilities: facilities.length, facilities };
    console.log(JSON.stringify(result, null, 2));
}

main().finally(() => db.$disconnect());
