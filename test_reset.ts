import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "teststaff@asilo.com";
    const password = await bcrypt.hash("123456", 10);

    // Get the first facility
    const facility = await prisma.facility.findFirst();

    if (!facility) {
        console.log("No facility found. Exiting.");
        return;
    }

    // Upsert the test user
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password,
            mustChangePassword: true,
            role: "STAFF",
            facilityId: facility.id
        },
        create: {
            name: "Test Staff",
            email,
            password,
            mustChangePassword: true,
            role: "STAFF",
            facilityId: facility.id
        }
    });

    console.log(`Test user ${user.email} created with ID ${user.id} and mustChangePassword=true`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
