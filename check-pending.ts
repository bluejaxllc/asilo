import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Check PendingRegistration
    const pending = await prisma.pendingRegistration.findMany({
        select: { email: true, name: true, role: true, createdAt: true },
    });
    console.log("Pending Registrations:", JSON.stringify(pending, null, 2));

    // Check if any User was created for these emails
    const emails = pending.map((p) => p.email);
    const users = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true, name: true, emailVerified: true },
    });
    console.log("Users with same emails (should be empty):", JSON.stringify(users, null, 2));

    // Check verification tokens
    const tokens = await prisma.verificationToken.findMany({
        where: { identifier: { in: emails } },
        select: { identifier: true, expires: true },
    });
    console.log("Verification Tokens:", JSON.stringify(tokens, null, 2));

    await prisma.$disconnect();
}

main().catch(console.error);
