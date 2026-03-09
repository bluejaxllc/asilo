import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const token = await prisma.verificationToken.findFirst({
        where: { identifier: 'edgar@bluejax.ai' },
        orderBy: { expires: 'desc' }
    });

    if (token) {
        console.log("DB TOKEN FOR EDGAR@BLUEJAX.AI IS: " + token.token);
    } else {
        console.log("NO TOKEN FOUND IN DB!");
    }
}
main();
