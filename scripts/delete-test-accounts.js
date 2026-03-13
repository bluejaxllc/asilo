const { config } = require('dotenv');
const { resolve } = require('path');
config({ path: resolve(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
    console.log("Using Database URL:", process.env.DATABASE_URL?.split('@')[1] || "None");
    const emailsToDelete = ['contacto@bluejax.ai', 'test@bluejax.ai', 'test123@test.com'];
    
    for (const email of emailsToDelete) {
        console.log(`Processing ${email}...`);
        
        // 1. Delete pending invites
        await db.inviteToken.deleteMany({ where: { email } });
        
        // 2. Delete pending registrations
        await db.pendingRegistration.deleteMany({ where: { email } });
        
        // 3. Find user
        const user = await db.user.findUnique({ where: { email } });
        if (user) {
            console.log(`Found user ${user.id}, deleting dependencies...`);
            
            // Reassign or delete tasks assigned to them
            await db.task.deleteMany({ where: { assignedToId: user.id } });
            await db.task.deleteMany({ where: { createdById: user.id } });
            
            // Delete daily logs
            await db.dailyLog.deleteMany({ where: { createdById: user.id } });
            
            // Delete attendance
            await db.attendance.deleteMany({ where: { userId: user.id } });
            
            // Delete the user
            await db.user.delete({ where: { id: user.id } });
            console.log(`Deleted user ${email} from Production DB`);
            
            if (user.facilityId) {
                const otherUsers = await db.user.count({ where: { facilityId: user.facilityId } });
                if (otherUsers === 0) {
                    console.log(`Facility ${user.facilityId} is now empty. Deleting it too...`);
                    const patients = await db.patient.findMany({ where: { facilityId: user.facilityId } });
                    for (const p of patients) {
                        await db.dailyLog.deleteMany({ where: { patientId: p.id }});
                        await db.task.deleteMany({ where: { patientId: p.id }});
                    }
                    await db.patient.deleteMany({ where: { facilityId: user.facilityId } });
                    await db.facilitySetting.deleteMany({ where: { facilityId: user.facilityId } });
                    await db.facility.delete({ where: { id: user.facilityId } });
                    console.log(`Deleted empty facility`);
                }
            }
        } else {
            console.log(`User ${email} not found in DB.`);
        }
    }
    console.log("Production DB Cleanup complete!");
}

main().catch(console.error).finally(() => db.$disconnect());
