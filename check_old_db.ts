import { PrismaClient } from '@prisma/client';

const oldUrl = "postgresql://postgres:Legolitas1!@db.rugaszeurphtkwzkxssu.supabase.co:5432/postgres";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: oldUrl,
        },
    },
});

async function main() {
    console.log("Checking OLD database for users...");
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true, name: true }
        });
        console.log(`Found ${users.length} users in the old database.`);
        console.table(users);
    } catch (e) {
        if (e instanceof Error) {
            console.error("Error connecting to old DB:", e.message);
        } else {
            console.error("Error connecting to old DB:", e);
        }
    }
}

main().finally(() => prisma.$disconnect());
