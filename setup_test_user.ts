import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("Setting up clean test user...");
    const password = await bcrypt.hash('123456', 10);

    // Create an empty facility like a real registration does
    const facility = await prisma.facility.create({
        data: { name: "Test Facility Unonboarded" }
    });

    // Create the admin user linked to this facility
    await prisma.user.upsert({
        where: { email: 'onboard@asilo.com' },
        update: { facilityId: facility.id },
        create: {
            email: 'onboard@asilo.com',
            name: 'Onboarder Test',
            role: 'ADMIN',
            password,
            facilityId: facility.id
        }
    });

    console.log("Created test user: onboard@asilo.com / 123456");
}

main().catch(console.error).finally(() => prisma.$disconnect());
