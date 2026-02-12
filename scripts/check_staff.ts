import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStaff() {
    try {
        console.log('Checking staff users in database...\n');

        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        console.log(`Total users in database: ${allUsers.length}\n`);

        const staffUsers = allUsers.filter(u =>
            ['STAFF', 'DOCTOR', 'NURSE', 'KITCHEN'].includes(u.role)
        );

        console.log(`Staff users (STAFF, DOCTOR, NURSE, KITCHEN): ${staffUsers.length}\n`);

        if (staffUsers.length > 0) {
            console.log('Staff members:');
            staffUsers.forEach(user => {
                console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
            });
        } else {
            console.log('⚠️  No staff users found!');
            console.log('\nAll users in database:');
            allUsers.forEach(user => {
                console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkStaff();
