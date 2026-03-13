require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    // Check for edgar@bluejax.ai and contact@bluejax.ai
    const emails = ['edgar@bluejax.ai', 'contact@bluejax.ai', 'contacto@bluejax.ai'];
    for (const email of emails) {
        const user = await db.user.findUnique({ where: { email } });
        const pending = await db.pendingRegistration.findUnique({ where: { email } });
        console.log(`${email}: user=${user ? 'EXISTS (id=' + user.id + ', facilityId=' + user.facilityId + ')' : 'NOT FOUND'}, pending=${pending ? 'EXISTS' : 'NOT FOUND'}`);
    }
    
    // Check all facilities
    const facilities = await db.facility.findMany();
    console.log('\nFacilities:');
    facilities.forEach(f => console.log(`  ${f.id} | ${f.name}`));
    
    // Check all users
    const users = await db.user.findMany({ select: { email: true, id: true, facilityId: true, role: true } });
    console.log('\nAll users:');
    users.forEach(u => console.log(`  ${u.email} | id=${u.id} | facility=${u.facilityId} | role=${u.role}`));
}

main().finally(() => db.$disconnect());
