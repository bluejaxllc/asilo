import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log("Sending test email to edgar@bluejax.ai from the newly verified bluejax.ai domain...");

    try {
        const { data, error } = await resend.emails.send({
            from: "Retiro BlueJax Verification <onboarding@bluejax.ai>",
            to: "edgar@bluejax.ai",
            subject: "Verifica tu cuenta — Test from BrowserOS",
            html: "<h1>It worked!</h1><p>The DNS records have propagated and you can now send emails from bluejax.ai via Resend.</p>",
        });

        if (error) {
            console.error("Failed to send:", error);
        } else {
            console.log("SUCCESS! Email sent. ID:", data?.id);
        }
    } catch (err) {
        console.error("Fatal error:", err);
    }
}

testEmail();
