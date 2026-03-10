/**
 * BlueJax / Asilo
 * Centralized Webhook Dispatcher for GoHighLevel
 * 
 * We use GHL to handle all actual WhatsApp messaging, ensuring reliable delivery,
 * templates, and tracking. Asilo simply pings the webhook with the necessary payload.
 */

interface WebhookPayload {
    type: "INCIDENT" | "HIGH_RISK_SUMMARY" | "PREMIUM_PURCHASE" | "ESCALATION_ALERT" | "BILLING_INCREMENT";
    patientName: string;
    patientId: string;
    familyPhone?: string;
    familyName?: string;
    message?: string;
    details?: any;
}

export const sendGhlWebhook = async (payload: WebhookPayload) => {
    // 1. Get the webhook URL from environment (provided by user in GHL)
    const webhookUrl = process.env.GHL_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("[GHL] GHL_WEBHOOK_URL is not set. Skipping webhook dispatch.");
        return false;
    }

    try {

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...payload,
                source: "asilo_os",
                timestamp: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            console.error("[GHL] Webhook returned non-2xx status:", response.status, response.statusText);
            return false;
        }

        return true;
    } catch (error) {
        console.error("[GHL] Failed to dispatch webhook:", error);
        return false;
    }
};

// ─── Convenience: Director Escalation Alert ──────────────────────────

export const sendDirectorAlert = async (opts: {
    residentName: string;
    residentId: string;
    reason: string;
    statusFlag?: string;
}) => {
    return sendGhlWebhook({
        type: "ESCALATION_ALERT",
        patientName: opts.residentName,
        patientId: opts.residentId,
        message: opts.reason,
        details: { statusFlag: opts.statusFlag || "Critical" },
    });
};

// ─── Convenience: Increment Monthly Extras (Billing) ─────────────────

export const incrementMonthlyExtras = async (opts: {
    residentName: string;
    residentId: string;
    services: string[];
}) => {
    return sendGhlWebhook({
        type: "BILLING_INCREMENT",
        patientName: opts.residentName,
        patientId: opts.residentId,
        message: `Extra services: ${opts.services.join(", ")}`,
        details: { services: opts.services, count: opts.services.length },
    });
};
