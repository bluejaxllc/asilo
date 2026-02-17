import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
    console.log("🌱 Seeding Family User...");

    // 1. Get a patient
    const patient = await db.patient.findFirst();

    if (!patient) {
        console.error("❌ No patients found. Please create a patient first.");
        return;
    }

    console.log(`Found patient: ${patient.name} (${patient.id})`);

    // 2. Create/Update Family User
    const email = "familia@example.com";
    const password = await bcrypt.hash("password", 10);

    const user = await db.user.upsert({
        where: { email },
        update: {
            role: "FAMILY",
            patientId: patient.id,
            password
        },
        create: {
            email,
            name: `Familia de ${patient.name.split(' ')[0]}`,
            role: "FAMILY",
            patientId: patient.id,
            password
        }
    });

    console.log(`
✅ Family User Ready!
--------------------------------
Email:    ${email}
Password: password
Patient:  ${patient.name}
Role:     FAMILY
--------------------------------
👉 Redirect to: http://localhost:3000/family
`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
