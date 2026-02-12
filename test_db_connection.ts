import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('DIRECT_URL present:', !!process.env.DIRECT_URL);

if (process.env.DATABASE_URL) {
    // Mask the password in the output
    const maskedUrl = process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@');
    console.log('DATABASE_URL:', maskedUrl);
}

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
});

async function testConnection() {
    try {
        console.log('\nTesting database connection...');
        const count = await prisma.patient.count();
        console.log('✅ SUCCESS! Patient count:', count);
        await prisma.$disconnect();
        process.exit(0);
    } catch (error: any) {
        console.error('❌ FAILED:', error.message);
        await prisma.$disconnect();
        process.exit(1);
    }
}

testConnection();
