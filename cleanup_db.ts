import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning up test accounts...");
    try {
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ['edgar@bluejax.ai', 'test.mls@bluejax.ai', 'test.mls.bos@bluejax.ai', 'edgar+testbos@bluejax.ai']
                }
            }
        });
        await prisma.pendingRegistration.deleteMany({
            where: {
                email: {
                    in: ['edgar@bluejax.ai', 'test.mls@bluejax.ai', 'test.mls.bos@bluejax.ai', 'edgar+testbos@bluejax.ai']
                }
            }
        });
        await prisma.verificationToken.deleteMany({
            where: {
                identifier: {
                    in: ['edgar@bluejax.ai', 'test.mls@bluejax.ai', 'test.mls.bos@bluejax.ai', 'edgar+testbos@bluejax.ai']
                }
            }
        });
        console.log("Cleanup complete!");
    } catch (e) {
        console.error("Error during cleanup:", e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
