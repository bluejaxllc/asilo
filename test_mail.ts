import { sendVerificationEmail } from './src/lib/mail';
import { PrismaClient } from '@prisma/client';

async function testEmail() {
    console.log("Sending test email to edgar@bluejax.ai...");
    try {
        await sendVerificationEmail("edgar@bluejax.ai", "888999");
        console.log("Email sent successfully!");
    } catch (e) {
        console.error("Error sending email:", e);
    }
}

testEmail();
