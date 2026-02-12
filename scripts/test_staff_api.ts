import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testStaffAPI() {
    try {
        // Simulate what the API does
        const staffUsers = await prisma.user.findMany({
            where: {
                role: {
                    in: ["STAFF", "DOCTOR", "NURSE", "KITCHEN"]
                }
            },
            orderBy: { name: 'asc' }
        });

        console.log(`Found ${staffUsers.length} staff users:\n`);

        staffUsers.forEach(user => {
            console.log(`✓ ${user.name} (${user.email}) - ${user.role}`);
        });

        if (staffUsers.length === 0) {
            console.log('\n⚠️  No staff users found in database!');
            console.log('The API endpoint would return an empty array.');
        } else {
            console.log('\n✅ Staff users exist - API should work correctly');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testStaffAPI();
