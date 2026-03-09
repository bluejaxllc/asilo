import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Resetting onboarding state...");
    const result = await prisma.facilitySetting.deleteMany({
        where: { key: "ONBOARDING_COMPLETED" }
    });
    console.log(`Deleted ${result.count} onboarding settings.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
