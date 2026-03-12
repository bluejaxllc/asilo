const { Resend } = require("resend");

async function test() {
    console.log("Initializing resend...");
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log("Calling send...");
    try {
        const result = await Promise.race([
            resend.emails.send({
                from: "onboarding@bluejax.ai",
                to: "test@example.com",
                subject: "Test",
                html: "<p>Test</p>"
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 5000))
        ]);
        console.log("Result:", result);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
