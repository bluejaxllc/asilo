"use server";

export async function sendWhatsAppAlert(to: string, message: string) {
    // WhatsApp simulator — no real messages sent

    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real scenario, we would call a provider like Twilio, Meta API, or a custom GHL webhook.
    // For now, we return success to allow the UI to show the flow.
    return {
        success: true,
        message: "Simulación: Alerta enviada correctamente via WhatsApp.",
        timestamp: new Date().toISOString()
    };
}
