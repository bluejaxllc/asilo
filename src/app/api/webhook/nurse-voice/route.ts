/**
 * Nurse Voice Pipeline — Webhook Endpoint
 * POST /api/webhook/nurse-voice
 * 
 * Receives transcribed voice note text from BlueJax workflow,
 * parses it into structured medical data via AI, then executes
 * the DUAL write to GHL CRM:
 *   1. Update contact custom fields (Folder 3 — Real-Time AI State)
 *   2. Append a permanent note to the contact timeline (audit trail)
 * 
 * Payload from BlueJax:
 * {
 *   "transcription": "string — the transcribed voice note text",
 *   "senderPhone": "string — nurse's WhatsApp number",
 *   "messageId": "string — GHL message ID (optional)",
 *   "contactId": "string — GHL contact ID if known (optional)"
 * }
 */

import { NextResponse } from 'next/server';
import { parseNurseVoiceNote } from '@/lib/ai-parser';
import {
    searchContactByName,
    updateContactFields,
    addContactNote,
    formatNoteBody,
} from '@/lib/ghl';
import { REALTIME_STATE, STATUS_FLAGS } from '@/lib/ghl-fields';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── Webhook Secret Validation ───────────────────────────────────────

function validateWebhookSecret(request: Request): boolean {
    const secret = request.headers.get('x-webhook-secret');
    const expectedSecret = process.env.WEBHOOK_SECRET;

    if (!expectedSecret) {
        console.warn('[Nurse Webhook] WEBHOOK_SECRET not configured — accepting all requests');
        return true;
    }

    return secret === expectedSecret;
}

// ─── Main Handler ────────────────────────────────────────────────────

export async function POST(request: Request) {
    // ── Step 0: Validate webhook secret ──
    if (!validateWebhookSecret(request)) {
        console.error('[Nurse Webhook] Unauthorized — invalid webhook secret');
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const payload = await request.json();
        const { transcription, senderPhone, contactId } = payload;

        if (!transcription) {
            return NextResponse.json(
                { error: 'Missing required field: transcription' },
                { status: 400 }
            );
        }

        console.log(`[Nurse Webhook] Received voice note from ${senderPhone || 'unknown'}`);
        console.log(`[Nurse Webhook] Transcription: "${transcription.substring(0, 100)}..."`);

        // ── Step 1: Parse transcription via AI ──
        const parsed = await parseNurseVoiceNote(transcription);
        console.log(`[Nurse Webhook] Parsed data:`, JSON.stringify(parsed, null, 2));

        // ── Step 2: Resolve the resident contact ──
        let resolvedContactId = contactId;

        if (!resolvedContactId && parsed.residentName) {
            const contact = await searchContactByName(parsed.residentName);
            if (contact) {
                resolvedContactId = contact.id;
                console.log(`[Nurse Webhook] Resolved "${parsed.residentName}" → contact ${resolvedContactId}`);
            } else {
                console.warn(`[Nurse Webhook] Could not find resident "${parsed.residentName}" in CRM`);
                return NextResponse.json({
                    success: false,
                    error: `Resident "${parsed.residentName}" not found in CRM`,
                    parsed,
                }, { status: 404 });
            }
        }

        if (!resolvedContactId) {
            return NextResponse.json({
                success: false,
                error: 'Could not determine resident contact. No contactId provided and no resident name parsed.',
                parsed,
            }, { status: 400 });
        }

        // ── Step 3: Generate timestamp ──
        const now = new Date();
        const timestamp = now.toLocaleString('es-MX', {
            timeZone: 'America/Mexico_City',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        // ── Step 4: DUAL WRITE — Update Fields + Add Note ──
        // 4a: Update Folder 3 (Real-Time AI State) custom fields
        const fieldUpdates = [
            { key: REALTIME_STATE.LAST_UPDATE_TIMESTAMP, field_value: now.toISOString() },
            { key: REALTIME_STATE.STATUS_FLAG, field_value: parsed.statusFlag },
            { key: REALTIME_STATE.TODAY_MEDS_STATUS, field_value: parsed.medsStatus },
            { key: REALTIME_STATE.TODAY_MEALS_STATUS, field_value: parsed.mealsStatus },
            { key: REALTIME_STATE.TODAY_VITALS_SUMMARY, field_value: parsed.vitalsSummary },
            { key: REALTIME_STATE.TODAY_GENERAL_NOTES, field_value: parsed.generalNotes },
        ];

        // 4b: Format audit trail note
        const noteBody = formatNoteBody({
            residentName: parsed.residentName,
            medsStatus: parsed.medsStatus,
            mealsStatus: parsed.mealsStatus,
            vitalsSummary: parsed.vitalsSummary,
            generalNotes: parsed.generalNotes,
            statusFlag: parsed.statusFlag,
            timestamp,
            rawTranscription: transcription,
        });

        // Execute both writes simultaneously
        const [, note] = await Promise.all([
            updateContactFields(resolvedContactId, fieldUpdates),
            addContactNote(resolvedContactId, noteBody),
        ]);

        console.log(`[Nurse Webhook] ✅ DUAL WRITE complete for contact ${resolvedContactId}`);

        // ── Step 5: Handle Critical Status escalation ──
        if (parsed.statusFlag === STATUS_FLAGS.CRITICAL) {
            console.log(`[Nurse Webhook] 🚨 CRITICAL STATUS — Triggering escalation for ${parsed.residentName}`);
            // TODO: Trigger BlueJax internal alert workflow
            // This would fire a webhook back to BlueJax to notify the facility director
        }

        // ── Step 6: Handle extra services (billing increment) ──
        if (parsed.extraServices.length > 0) {
            console.log(`[Nurse Webhook] 💰 Extra services detected:`, parsed.extraServices);
            // TODO: Increment Current_Month_Extras_MXN via separate logic
        }

        return NextResponse.json({
            success: true,
            contactId: resolvedContactId,
            residentName: parsed.residentName,
            statusFlag: parsed.statusFlag,
            fieldsUpdated: fieldUpdates.length,
            noteCreated: true,
            extraServicesDetected: parsed.extraServices,
            timestamp,
        });

    } catch (error) {
        console.error('[Nurse Webhook] Error processing voice note:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// ─── Health check for webhook testing ────────────────────────────────

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: '/api/webhook/nurse-voice',
        description: 'Nurse Voice-to-CRM Pipeline',
        timestamp: new Date().toISOString(),
    });
}
