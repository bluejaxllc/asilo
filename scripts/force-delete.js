const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
    console.log("Checking DB URL:", process.env.DATABASE_URL?.split('@')[1]);
    const users = await db.user.findMany({
        where: { email: { contains: 'bluejax.ai' } }
    });
    console.log("Found users before delete:", users.map(u => u.email));
    
    const emailsToDelete = ['contacto@bluejax.ai', 'test@bluejax.ai', 'test123@test.com'];
    
    for (const email of emailsToDelete) {
        await db.inviteToken.deleteMany({ where: { email } });
        await db.pendingRegistration.deleteMany({ where: { email } });
        const user = await db.user.findUnique({ where: { email } });
        if (user) {
            await db.task.deleteMany({ where: { assignedToId: user.id } });
            await db.task.deleteMany({ where: { createdById: user.id } });
            await db.dailyLog.deleteMany({ where: { createdById: user.id } });
            await db.attendance.deleteMany({ where: { userId: user.id } });
            await db.user.delete({ where: { id: user.id } });
            console.log(`Force deleted ${email} from Production db!`);
        }
    }
    
    const remaining = await db.user.findMany({
        where: { email: { in: emailsToDelete } }
    });
    console.log("Remaining users:", remaining.length);
}

main().finally(() => db.$disconnect());
