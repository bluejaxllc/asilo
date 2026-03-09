import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking onboarding settings...");
    const settings = await prisma.facilitySetting.findMany({
        where: { key: "ONBOARDING_COMPLETED" }
    });
    console.log("Found:", settings);
}

main().catch(console.error).finally(() => prisma.$disconnect());
