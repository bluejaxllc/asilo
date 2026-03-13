require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const email = 'edgar@bluejax.ai';
    
    // Find the user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
        console.log(`${email} not found in Users table`);
    } else {
        const facilityId = user.facilityId;
        console.log(`Found ${email} | id=${user.id} | facilityId=${facilityId}`);
        
        // Delete all related records for this user
        const tables = ['attendance', 'dailyLog', 'auditLog', 'task', 'notification'];
        for (const table of tables) {
            try {
                const count = await db[table].deleteMany({ where: { userId: user.id } });
                if (count.count > 0) console.log(`  Deleted ${count.count} ${table} records`);
            } catch(e) { /* table might not have userId */ }
            try {
                const count = await db[table].deleteMany({ where: { authorId: user.id } });
                if (count.count > 0) console.log(`  Deleted ${count.count} ${table} (author) records`);
            } catch(e) {}
        }
        
        // Delete the user
        await db.user.delete({ where: { id: user.id } });
        console.log(`  Deleted user ${email}`);
        
        // Delete facility settings
        if (facilityId) {
            const settings = await db.facilitySetting.deleteMany({ where: { facilityId } });
            console.log(`  Deleted ${settings.count} facility settings`);
            
            // Delete invite tokens for this facility
            const tokens = await db.inviteToken.deleteMany({ where: { facilityId } });
            console.log(`  Deleted ${tokens.count} invite tokens`);
            
            // Check if any other users reference this facility
            const otherUsers = await db.user.count({ where: { facilityId } });
            if (otherUsers === 0) {
                // Delete patients, then facility
                try {
                    const patients = await db.patient.deleteMany({ where: { facilityId } });
                    console.log(`  Deleted ${patients.count} patients`);
                } catch(e) {}
                
                await db.facility.delete({ where: { id: facilityId } });
                console.log(`  Deleted facility ${facilityId}`);
            } else {
                console.log(`  Facility still has ${otherUsers} other users, kept`);
            }
        }
    }
    
    // Also clean up any pending registrations
    const pending = await db.pendingRegistration.deleteMany({ where: { email } });
    if (pending.count > 0) console.log(`Deleted ${pending.count} pending registrations for ${email}`);
    
    // Clean up verification tokens
    const vTokens = await db.verificationToken.deleteMany({ where: { identifier: email } });
    if (vTokens.count > 0) console.log(`Deleted ${vTokens.count} verification tokens for ${email}`);
    
    // Also cleanup orphaned facility from previous deletions
    try {
        const orphan = await db.facility.findUnique({ where: { id: 'cmmisrmuf0000260u5yame392' } });
        if (orphan) {
            const count = await db.user.count({ where: { facilityId: orphan.id } });
            if (count === 0) {
                await db.facilitySetting.deleteMany({ where: { facilityId: orphan.id } });
                await db.facility.delete({ where: { id: orphan.id } });
                console.log(`Deleted orphaned facility: ${orphan.name}`);
            }
        }
    } catch(e) { console.log('Orphan cleanup skipped:', e.message); }
    
    console.log('\n=== DONE. DB is clean for fresh registration test ===');
}

main().catch(console.error).finally(() => db.$disconnect());
