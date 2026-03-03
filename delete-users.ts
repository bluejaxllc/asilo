import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const emails = ["edgar@bluejax.ai", "contact@bluejax.ai"];

    const users = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { id: true, email: true, name: true },
    });
    console.log("Found users:", users);

    if (users.length === 0) {
        console.log("No users found with those emails");
        return;
    }

    const userIds = users.map((u) => u.id);

    // Delete ALL related records using correct field names from schema
    await prisma.familyMessage.deleteMany({ where: { fromUserId: { in: userIds } } });
    await prisma.dailyLog.deleteMany({ where: { authorId: { in: userIds } } });
    await prisma.task.deleteMany({ where: { assignedToId: { in: userIds } } });
    await prisma.attendance.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.account.deleteMany({ where: { userId: { in: userIds } } });

    for (const user of users) {
        if (user.email) {
            await prisma.verificationToken.deleteMany({
                where: { identifier: user.email },
            });
        }
    }

    await prisma.user.deleteMany({ where: { id: { in: userIds } } });

    console.log("Done! Deleted:", users.map((u) => u.email).join(", "));
    await prisma.$disconnect();
}

main().catch(console.error);
