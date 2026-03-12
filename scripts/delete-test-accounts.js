const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
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
            console.log(`Deleted user ${email}`);
            
            // Check if they were the only admin of a facility, maybe delete the facility too? 
            // For now just leave the facility as it might have other things, or we can check:
            if (user.facilityId) {
                const otherUsers = await db.user.count({ where: { facilityId: user.facilityId } });
                if (otherUsers === 0) {
                    console.log(`Facility ${user.facilityId} is now empty. Deleting it too...`);
                    // gotta delete patients first
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
        }
    }
    console.log("Cleanup complete!");
}

main().catch(console.error).finally(() => db.$disconnect());
