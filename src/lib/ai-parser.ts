/**
 * AI Parser Library
 * 
 * Uses Google Gemini Pro (via @ai-sdk/google) to:
 * 1. Parse nurse voice note transcriptions into structured CRM data
 * 2. Classify family message intent (Status / Billing / Emergency)
 * 3. Generate family-facing responses with strict system prompt constraints
 * 
 * All prompts are in Spanish context (Mexican retirement home).
 */

import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// ─── Types ───────────────────────────────────────────────────────────

export interface ParsedNurseVoiceNote {
    residentName: string;
    medsStatus: string;
    mealsStatus: string;
    vitalsSummary: string;
    generalNotes: string;
    extraServices: string[];
    statusFlag: 'Normal' | 'Attention Needed' | 'Critical';
}

export type FamilyIntent = 'STATUS' | 'BILLING' | 'EMERGENCY';

// ─── Schemas for structured output ───────────────────────────────────

const nurseVoiceNoteSchema = z.object({
    residentName: z.string().describe('Full name of the resident mentioned in the voice note'),
    medsStatus: z.string().describe('Medication status, e.g. "Morning taken, Afternoon refused"'),
    mealsStatus: z.string().describe('Meal status, e.g. "Breakfast 100%, Lunch 20%"'),
    vitalsSummary: z.string().describe('Vitals summary, e.g. "BP 120/80, Temp 37C"'),
    generalNotes: z.string().describe('General observations and notes'),
    extraServices: z.array(z.string()).describe('Extra billable services mentioned (haircut, therapy, etc.)'),
    statusFlag: z.enum(['Normal', 'Attention Needed', 'Critical']).describe(
        'Overall status: Normal if routine, Attention Needed if something is off, Critical if emergency'
    ),
});

const intentSchema = z.object({
    intent: z.enum(['STATUS', 'BILLING', 'EMERGENCY']).describe(
        'The classified intent: STATUS for health/wellbeing queries, BILLING for payment/cost queries, EMERGENCY for urgent/panic messages'
    ),
    confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),
});

// ─── Nurse Voice Note Parser ─────────────────────────────────────────

/**
 * Parse a nurse's voice note transcription into structured CRM data.
 * 
 * This is the "Intelligence Layer" (Step 3) of the architecture.
 * The AI acts as a strict medical data extraction bot.
 */
export async function parseNurseVoiceNote(
    transcription: string
): Promise<ParsedNurseVoiceNote> {
    const { object } = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: nurseVoiceNoteSchema,
        system: `You are a medical data extraction bot for a Mexican retirement home (asilo).
You extract structured data from nurse voice note transcriptions. The transcriptions are in Spanish.

RULES:
- Extract the resident's name exactly as mentioned. If only a first name is given, use that.
- For medications: describe what was taken/refused with time context (morning/afternoon/night).
- For meals: use percentage format when possible (e.g., "Desayuno 100%, Comida 50%").
- For vitals: include BP (presión), temperature (temperatura), heart rate (pulso), oxygen (oxígeno) if mentioned.
- For general notes: summarize any observations, mood, activities, or incidents.
- For extra services: list any billable extras like haircuts (corte de pelo), therapy sessions (terapia), medical consultations (consulta médica).
- For status flag:
  - "Normal" = routine update, everything is fine
  - "Attention Needed" = something is slightly off (refused food all day, mild fever, unusual behavior)
  - "Critical" = emergency situation (fall, high fever, difficulty breathing, unresponsive)
- If a field has no data mentioned, use "Sin información reportada" (no information reported).
- NEVER invent or assume data not present in the transcription.`,
        prompt: `Extract structured medical data from this nurse voice note transcription:\n\n"${transcription}"`,
    });

    return object;
}

// ─── Family Intent Classifier ────────────────────────────────────────

/**
 * Classify the intent of a family member's WhatsApp message.
 * 
 * This is Layer 2 (Intent Routing / Triage) of the family bot.
 * Uses lightweight classification to route to the correct handler.
 */
export async function classifyFamilyIntent(
    message: string
): Promise<{ intent: FamilyIntent; confidence: number }> {
    const { object } = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: intentSchema,
        system: `You are an intent classifier for a Mexican retirement home's WhatsApp bot.
Classify the family member's message into one of three intents:

STATUS — Questions about the resident's health, wellbeing, daily activities, meals, medication.
Examples: "¿Cómo está mi mamá?", "¿Ya comió?", "¿Tomó sus medicinas?", "¿Cómo amaneció?"

BILLING — Questions about costs, payments, invoices, fees, extra charges.
Examples: "¿Cuánto debo?", "¿Ya se generó la factura?", "¿Cuánto cuesta el corte?", "¿Cuándo es el pago?"

EMERGENCY — Panic, urgency, medical emergency mentions, requests to talk to a doctor.
Examples: "Emergencia", "¿Está en el hospital?", "Necesito hablar con el doctor", "¿Qué pasó?", "Urgente"

Rules:
- Default to STATUS if unclear.
- EMERGENCY takes priority — if any emergency keywords are present, classify as EMERGENCY.
- The messages will be in Spanish.`,
        prompt: `Classify this message: "${message}"`,
    });

    return object;
}

// ─── Family Response Generator ───────────────────────────────────────

/**
 * Generate a family-facing response using resident CRM data.
 * 
 * This is Layer 3 (The System Prompt / Straitjacket) of the family bot.
 * The response is strictly constrained to only use provided data.
 */
export async function generateFamilyResponse(
    residentData: {
        residentId: string;
        lastUpdateTimestamp: string;
        medsStatus: string;
        mealsStatus: string;
        vitalsSummary: string;
        generalNotes: string;
    },
    familyQuestion: string
): Promise<string> {
    const { text } = await generateText({
        model: google('gemini-2.0-flash'),
        system: `Eres un conserje educado y estrictamente informativo para un asilo de retiro premium. Estás hablando con un familiar autorizado.

TUS DATOS:
Residente: ${residentData.residentId}
Última Actualización: ${residentData.lastUpdateTimestamp}
Medicamentos: ${residentData.medsStatus}
Alimentación: ${residentData.mealsStatus}
Signos Vitales: ${residentData.vitalsSummary}
Notas: ${residentData.generalNotes}

TUS REGLAS — SERÁS ELIMINADO SI LAS ROMPES:

1. NUNCA diagnostiques, predirás ni ofrecerás opiniones médicas.
2. NUNCA generes información que no esté explícitamente en 'TUS DATOS'.
3. Si el usuario pregunta algo no cubierto por 'TUS DATOS', responde exactamente con: "No tengo esa información en este momento. ¿Le gustaría que le pida a la enfermera en turno que se comunique con usted?"
4. Mantén las respuestas en máximo 3 oraciones. Sé cálido pero clínico.
5. SIEMPRE menciona la hora de 'Última Actualización' para que el usuario sepa que esto es una instantánea, no un feed en vivo.
6. Responde SIEMPRE en español.`,
        prompt: familyQuestion,
    });

    return text;
}

/**
 * Generate a billing response using resident CRM data.
 */
export async function generateBillingResponse(
    billingData: {
        residentId: string;
        baseMonthlyFee: string;
        currentMonthExtras: string;
        nextInvoiceDate: string;
    },
    familyQuestion: string
): Promise<string> {
    const { text } = await generateText({
        model: google('gemini-2.0-flash'),
        system: `Eres un asistente administrativo para un asilo de retiro premium. Estás hablando con un familiar autorizado sobre temas financieros.

TUS DATOS:
Residente: ${billingData.residentId}
Cuota Mensual Base: $${billingData.baseMonthlyFee} MXN
Extras del Mes Actual: $${billingData.currentMonthExtras} MXN
Próxima Fecha de Facturación: ${billingData.nextInvoiceDate}
Total Estimado: $${Number(billingData.baseMonthlyFee || 0) + Number(billingData.currentMonthExtras || 0)} MXN

TUS REGLAS:
1. Solo proporciona información financiera que esté en 'TUS DATOS'.
2. Si preguntan por detalles específicos de extras, responde: "Para el desglose detallado de extras, por favor contacte a administración al número principal."
3. Mantén las respuestas en máximo 3 oraciones.
4. Responde SIEMPRE en español.`,
        prompt: familyQuestion,
    });

    return text;
}
