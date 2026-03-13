require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const emailsToDelete = ['contact@bluejax.ai', 'edgar@bluejax.ai', 'contacto@bluejax.ai', 'test@bluejax.ai', 'ana.family@test-asilo.com'];
    
    for (const email of emailsToDelete) {
        await db.inviteToken.deleteMany({ where: { email } });
        await db.pendingRegistration.deleteMany({ where: { email } });
        
        const user = await db.user.findUnique({ where: { email } });
        if (user) {
            console.log(`Deleting ${email}...`);
            // Explicitly delete all relations that don't have onDelete: Cascade
            try { await db.task.deleteMany({ where: { assignedToId: user.id } }); } catch(e){}
            try { await db.task.deleteMany({ where: { createdById: user.id } }); } catch(e){}
            try { await db.attendance.deleteMany({ where: { userId: user.id } }); } catch(e){}
            try { await db.dailyLog.deleteMany({ where: { authorId: user.id } }); } catch(e){}
            try { await db.auditLog.deleteMany({ where: { userId: user.id } }); } catch(e){}
            try { await db.familyMessage.deleteMany({ where: { fromUserId: user.id } }); } catch(e){}
            try { await db.premiumPurchase.deleteMany({ where: { familyMemberId: user.id } }); } catch(e){}
            
            try {
                await db.user.delete({ where: { id: user.id } });
                console.log(`Force deleted ${email} from Production db!`);
            } catch (e) {
                console.error(`Failed to delete user ${email}:`, e.message);
            }
            
            if (user.facilityId) {
                const otherUsers = await db.user.count({ where: { facilityId: user.facilityId } });
                if (otherUsers === 0) {
                    const patients = await db.patient.findMany({ where: { facilityId: user.facilityId } });
                    for (const p of patients) {
                        try { await db.dailyLog.deleteMany({ where: { patientId: p.id }}); } catch(e){}
                        try { await db.task.deleteMany({ where: { patientId: p.id }}); } catch(e){}
                        try { await db.notification.deleteMany({ where: { patientId: p.id } }); } catch(e){}
                        try { await db.patientMedication.deleteMany({ where: { patientId: p.id } }); } catch(e){}
                    }
                    try { await db.patient.deleteMany({ where: { facilityId: user.facilityId } }); } catch(e){}
                    try { await db.facilitySetting.deleteMany({ where: { facilityId: user.facilityId } }); } catch(e){}
                    try { await db.medication.deleteMany({ where: { facilityId: user.facilityId } }); } catch(e){}
                    try { await db.notification.deleteMany({ where: { facilityId: user.facilityId } }); } catch(e){}
                    try { await db.auditLog.deleteMany({ where: { facilityId: user.facilityId } }); } catch(e){}
                    try { await db.facility.delete({ where: { id: user.facilityId } }); } catch(e){}
                    console.log(`Deleted empty facility ${user.facilityId}`);
                }
            }
        } else {
            console.log(`${email} already gone!`);
        }
    }
}

main().catch(console.error).finally(() => db.$disconnect());
