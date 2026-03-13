require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

(async () => {
    const u = await db.user.findUnique({ where: { email: 'edgar@bluejax.ai' } });
    const c = await db.user.findUnique({ where: { email: 'contact@bluejax.ai' } });
    console.log('edgar@bluejax.ai:', u ? 'EXISTS' : 'GONE');
    console.log('contact@bluejax.ai:', c ? 'EXISTS' : 'GONE');
    await db.$disconnect();
})();
