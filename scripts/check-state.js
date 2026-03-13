require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const users = await db.user.findMany({ select: { email: true, role: true, facilityId: true } });
    const facilities = await db.facility.findMany({ select: { id: true, name: true, plan: true } });
    const pending = await db.pendingRegistration.findMany();
    const settings = await db.facilitySetting.findMany();
    
    const result = { users, facilities, pending, settings };
    require('fs').writeFileSync('C:\\tmp\\db-state.json', JSON.stringify(result, null, 2));
    console.log('Written to C:\\tmp\\db-state.json');
}

main().finally(() => db.$disconnect());
