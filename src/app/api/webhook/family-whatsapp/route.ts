/**
 * Family WhatsApp Bot — Webhook Endpoint
 * POST /api/webhook/family-whatsapp
 * 
 * Implements the 4-layer security architecture:
 *   Layer 1: Hardcoded Bouncer (phone number authentication)
 *   Layer 2: Intent Routing (Status / Billing / Emergency)
 *   Layer 3: System Prompt Response Generation
 *   Layer 4: Escalation Protocol (Critical status bypass)
 * 
 * Payload from BlueJax:
 * {
 *   "message": "string — the family member's text message",
 *   "senderPhone": "string — WhatsApp sender number",
 *   "senderName": "string — sender's name (optional)",
 *   "contactId": "string — GHL contact ID if resolved (optional)"
 * }
 * 
 * Response:
 * {
 *   "reply": "string — the bot's response to send back via WhatsApp",
 *   "intent": "STATUS" | "BILLING" | "EMERGENCY",
 *   "authorized": boolean,
 *   "escalated": boolean
 * }
 */

import { NextResponse } from 'next/server';
import {
    classifyFamilyIntent,
    generateFamilyResponse,
    generateBillingResponse,
} from '@/lib/ai-parser';
import {
    searchContactByAuthorizedPhone,
    getContactById,
    getCustomFieldValue,
    type GHLContact,
} from '@/lib/ghl';
import { REALTIME_STATE, CASHFLOW, RESIDENT_CORE, GUARDIAN_ACCESS, STATUS_FLAGS } from '@/lib/ghl-fields';
import { sendDirectorAlert } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── Hardcoded Messages (Layer 1 & Layer 4) ──────────────────────────

const UNAUTHORIZED_MESSAGE =
    'Hola. Este número no está autorizado para recibir información médica o de estado. ' +
    'Por favor comuníquese a la administración al número principal del asilo.';

const ESCALATION_MESSAGE = (familyName: string, residentId: string) =>
    `Hola ${familyName}. El director médico ha solicitado hablar con usted ` +
    `sobre la actualización de ${residentId}. Por favor, responda a este mensaje ` +
    `para conectarlo inmediatamente, o llame al número de emergencias del asilo.`;

const DIRECTOR_ALERT = (residentId: string) =>
    `🚨 Alerta: La familia de ${residentId} está intentando obtener información ` +
    `y el paciente está en estado Crítico. Llámalos AHORA.`;

const EMERGENCY_RESPONSE =
    'Entiendo su preocupación. Estoy conectándolo inmediatamente con el personal médico en turno. ' +
    'Por favor permanezca en línea o llame al número de emergencias del asilo.';

// ─── Webhook Secret Validation ───────────────────────────────────────

function validateWebhookSecret(request: Request): boolean {
    const secret = request.headers.get('x-webhook-secret');
    const expectedSecret = process.env.WEBHOOK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
        console.error('[Family Bot] Unauthorized — invalid or missing webhook secret');
        return false;
    }

    return true;
}

// ─── Main Handler ────────────────────────────────────────────────────

export async function POST(request: Request) {
    // ── Validate webhook secret ──
    if (!validateWebhookSecret(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payload = await request.json();
        const { message, senderPhone } = payload;

        if (!message || !senderPhone) {
            return NextResponse.json(
                { error: 'Missing required fields: message, senderPhone' },
                { status: 400 }
            );
        }


        // ══════════════════════════════════════════════════════════════
        // LAYER 1: THE HARDCODED BOUNCER (Authentication)
        // ══════════════════════════════════════════════════════════════

        const contact = await searchContactByAuthorizedPhone(senderPhone);

        if (!contact) {
            return NextResponse.json({
                reply: UNAUTHORIZED_MESSAGE,
                intent: null,
                authorized: false,
                escalated: false,
            });
        }


        // Get full contact details with custom fields
        const fullContact = await getContactById(contact.id);
        if (!fullContact) {
            console.error(`[Family Bot] Could not fetch full contact details for ${contact.id}`);
            return NextResponse.json(
                { error: 'Contact details unavailable' },
                { status: 500 }
            );
        }

        // Extract key identifiers
        const residentId = getCustomFieldValue(fullContact, RESIDENT_CORE.RESIDENT_ID) || contact.name || 'Residente';
        const familyName = getCustomFieldValue(fullContact, GUARDIAN_ACCESS.AUTHORIZED_FAMILY_NAME) || 'Familiar';
        const statusFlag = getCustomFieldValue(fullContact, REALTIME_STATE.STATUS_FLAG) || STATUS_FLAGS.NORMAL;

        // ══════════════════════════════════════════════════════════════
        // LAYER 4: ESCALATION PROTOCOL (pre-check before any AI)
        // If Status_Flag is Critical, bypass AI entirely
        // ══════════════════════════════════════════════════════════════

        if (statusFlag === STATUS_FLAGS.CRITICAL || statusFlag === STATUS_FLAGS.ATTENTION_NEEDED) {

            if (statusFlag === STATUS_FLAGS.CRITICAL) {
                await sendDirectorAlert({
                    residentName: residentId,
                    residentId: contact.id,
                    reason: DIRECTOR_ALERT(residentId),
                    statusFlag: 'Critical',
                });

                return NextResponse.json({
                    reply: ESCALATION_MESSAGE(familyName, residentId),
                    intent: 'EMERGENCY',
                    authorized: true,
                    escalated: true,
                    directorAlert: DIRECTOR_ALERT(residentId),
                });
            }
            // Attention Needed — continue but flag it
        }

        // ══════════════════════════════════════════════════════════════
        // LAYER 2: INTENT ROUTING (The Triage)
        // ══════════════════════════════════════════════════════════════

        const { intent, confidence } = await classifyFamilyIntent(message);

        // ══════════════════════════════════════════════════════════════
        // LAYER 3: RESPONSE GENERATION (The Straitjacket)
        // ══════════════════════════════════════════════════════════════

        let reply: string;

        switch (intent) {
            case 'STATUS': {
                // Pull from Folder 3: Real-Time AI State
                const residentData = {
                    residentId,
                    lastUpdateTimestamp: getCustomFieldValue(fullContact, REALTIME_STATE.LAST_UPDATE_TIMESTAMP) || 'No disponible',
                    medsStatus: getCustomFieldValue(fullContact, REALTIME_STATE.TODAY_MEDS_STATUS) || 'Sin información',
                    mealsStatus: getCustomFieldValue(fullContact, REALTIME_STATE.TODAY_MEALS_STATUS) || 'Sin información',
                    vitalsSummary: getCustomFieldValue(fullContact, REALTIME_STATE.TODAY_VITALS_SUMMARY) || 'Sin información',
                    generalNotes: getCustomFieldValue(fullContact, REALTIME_STATE.TODAY_GENERAL_NOTES) || 'Sin información',
                };

                // Format timestamp for human readability
                if (residentData.lastUpdateTimestamp !== 'No disponible') {
                    try {
                        const date = new Date(residentData.lastUpdateTimestamp);
                        residentData.lastUpdateTimestamp = date.toLocaleString('es-MX', {
                            timeZone: 'America/Mexico_City',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        });
                    } catch {
                        // Keep raw value if parsing fails
                    }
                }

                reply = await generateFamilyResponse(residentData, message);
                break;
            }

            case 'BILLING': {
                // Pull from Folder 4: Cashflow Engine
                const billingData = {
                    residentId,
                    baseMonthlyFee: getCustomFieldValue(fullContact, CASHFLOW.BASE_MONTHLY_FEE_MXN) || '0',
                    currentMonthExtras: getCustomFieldValue(fullContact, CASHFLOW.CURRENT_MONTH_EXTRAS_MXN) || '0',
                    nextInvoiceDate: getCustomFieldValue(fullContact, CASHFLOW.NEXT_INVOICE_DATE) || 'No programada',
                };

                // Format date if available
                if (billingData.nextInvoiceDate !== 'No programada') {
                    try {
                        const date = new Date(billingData.nextInvoiceDate);
                        billingData.nextInvoiceDate = date.toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });
                    } catch {
                        // Keep raw value
                    }
                }

                reply = await generateBillingResponse(billingData, message);
                break;
            }

            case 'EMERGENCY': {
                // Do NOT use AI for emergencies — hardcoded response
                console.log(`[Family Bot] 🚨 EMERGENCY intent detected — hardcoded response`);
                reply = EMERGENCY_RESPONSE;

                // Trigger human escalation workflow
                await sendDirectorAlert({
                    residentName: residentId,
                    residentId: contact.id,
                    reason: `🚨 EMERGENCIA: Familia reporta emergencia via WhatsApp. Mensaje: "${message.substring(0, 200)}"`,
                    statusFlag: 'Critical',
                });
                break;
            }

            default:
                reply = 'No tengo esa información en este momento. ¿Le gustaría que le pida a la enfermera en turno que se comunique con usted?';
        }

        return NextResponse.json({
            reply,
            intent,
            authorized: true,
            escalated: false,
            confidence,
        });

    } catch (error) {
        console.error('[Family Bot] Error processing message:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// ─── Health check ────────────────────────────────────────────────────

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: '/api/webhook/family-whatsapp',
        description: 'Family WhatsApp Bot — 4-Layer Security Architecture',
        layers: [
            'Layer 1: Hardcoded Bouncer (Phone Auth)',
            'Layer 2: Intent Routing (Status/Billing/Emergency)',
            'Layer 3: System Prompt Response (AI Straitjacket)',
            'Layer 4: Escalation Protocol (Critical Status)',
        ],
        timestamp: new Date().toISOString(),
    });
}
