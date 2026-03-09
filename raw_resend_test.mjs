import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let resendKey = '';
for (const line of lines) {
    if (line.startsWith('RESEND_API_KEY=')) {
        resendKey = line.split('=')[1].trim().replace(/['"]/g, '');
        break;
    }
}

if (!resendKey) throw new Error("RESEND_API_KEY not found in .env");

const resend = new Resend(resendKey);

async function testEmail() {
    console.log("Sending test email to edgar@bluejax.ai from verified bluejax.ai domain...");

    try {
        const { data, error } = await resend.emails.send({
            from: "Retiro BlueJax <onboarding@bluejax.ai>",
            to: "edgar@bluejax.ai",
            subject: "Verification Flow Success! — BrowserOS",
            html: "<h1>It worked!</h1><p>The DNS records propagated successfully and Resend is delivering from <strong>bluejax.ai</strong>.</p><p>We have successfully verified the email flow without hitting bounce limits or test-environment restrictions.</p>",
        });

        if (error) {
            console.error("Failed to send:", error);
        } else {
            console.log("SUCCESS! Email sent successfully. Resend ID:", data?.id);
        }
    } catch (err) {
        console.error("Fatal error:", err);
    }
}

testEmail();
