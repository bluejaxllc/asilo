require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    // Delete the staff user that was created without an email invite
    const email = 'contact@bluejax.ai';
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
        // Clean up any related data
        try { await db.attendance.deleteMany({ where: { userId: user.id } }); } catch(e){}
        try { await db.dailyLog.deleteMany({ where: { authorId: user.id } }); } catch(e){}
        try { await db.auditLog.deleteMany({ where: { userId: user.id } }); } catch(e){}
        
        await db.user.delete({ where: { id: user.id } });
        console.log(`Deleted ${email} from production DB - ready for fresh invite`);
    } else {
        console.log(`${email} not found`);
    }
    
    // Also delete any stale invite tokens
    const deleted = await db.inviteToken.deleteMany({ where: { email } });
    console.log(`Deleted ${deleted.count} old invite tokens for ${email}`);
    
    // Also clean up the orphaned facility from the old deleted account
    const orphan = await db.facility.findUnique({ where: { id: 'cmmisrmuf0000260u5yame392' } });
    if (orphan) {
        const userCount = await db.user.count({ where: { facilityId: orphan.id } });
        if (userCount === 0) {
            try { await db.facilitySetting.deleteMany({ where: { facilityId: orphan.id } }); } catch(e){}
            await db.facility.delete({ where: { id: orphan.id } });
            console.log(`Deleted orphaned facility: ${orphan.name}`);
        }
    }
}

main().catch(console.error).finally(() => db.$disconnect());
