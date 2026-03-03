/**
 * GoHighLevel (GHL) API Client
 * 
 * Wraps the GHL API v2 endpoints for:
 * - Contact search (by phone, name, ID)
 * - Contact field updates (Folder 3 real-time state)
 * - Contact notes (audit trail)
 * 
 * Base URL: https://services.leadconnectorhq.com
 * Auth: Bearer token via GHL_API_KEY env var
 * Required headers: Authorization, Version
 */

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

function getHeaders(): Record<string, string> {
    const apiKey = process.env.GHL_API_KEY;
    if (!apiKey) {
        throw new Error('GHL_API_KEY environment variable is not set');
    }
    return {
        'Authorization': `Bearer ${apiKey}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json',
    };
}

function getLocationId(): string {
    const locationId = process.env.GHL_LOCATION_ID;
    if (!locationId) {
        throw new Error('GHL_LOCATION_ID environment variable is not set');
    }
    return locationId;
}

// ─── Types ───────────────────────────────────────────────────────────

export interface GHLContact {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    email?: string;
    customFields?: Array<{
        id: string;
        key: string;
        value: string;
        fieldValue: string;
    }>;
}

export interface GHLSearchResult {
    contacts: GHLContact[];
    total: number;
}

export interface GHLNote {
    id: string;
    body: string;
    contactId: string;
    dateAdded: string;
}

export interface CustomFieldUpdate {
    key: string;
    field_value: string;
}

// ─── Contact Search ──────────────────────────────────────────────────

/**
 * Search for a contact by their Authorized WhatsApp Number (custom field).
 * Used for family bot authentication — Layer 1.
 */
export async function searchContactByPhone(phone: string): Promise<GHLContact | null> {
    const locationId = getLocationId();

    const response = await fetch(`${GHL_BASE_URL}/contacts/search`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            locationId,
            filters: [
                {
                    field: 'phone',
                    operator: 'eq',
                    value: phone,
                },
            ],
            page: 1,
            pageLimit: 1,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GHL] searchContactByPhone failed: ${response.status}`, errorText);
        throw new Error(`GHL API error: ${response.status}`);
    }

    const data: GHLSearchResult = await response.json();
    return data.contacts.length > 0 ? data.contacts[0] : null;
}

/**
 * Search for a contact by the Authorized WhatsApp Number custom field.
 * Used for family bot authentication — matches against the custom field
 * in Folder 2 (Guardian & Access Control).
 */
export async function searchContactByAuthorizedPhone(phone: string): Promise<GHLContact | null> {
    const locationId = getLocationId();

    // Normalize phone number: remove spaces, dashes, ensure + prefix
    const normalizedPhone = phone.replace(/[\s-()]/g, '');

    const response = await fetch(`${GHL_BASE_URL}/contacts/search`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            locationId,
            filters: [
                {
                    field: 'contact.authorized_whatsapp_number',
                    operator: 'eq',
                    value: normalizedPhone,
                },
            ],
            page: 1,
            pageLimit: 1,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GHL] searchContactByAuthorizedPhone failed: ${response.status}`, errorText);
        throw new Error(`GHL API error: ${response.status}`);
    }

    const data: GHLSearchResult = await response.json();
    return data.contacts.length > 0 ? data.contacts[0] : null;
}

/**
 * Search for a resident contact by name.
 * Used by the nurse voice pipeline to resolve "Roberto" → contact ID.
 */
export async function searchContactByName(name: string): Promise<GHLContact | null> {
    const locationId = getLocationId();

    const response = await fetch(`${GHL_BASE_URL}/contacts/search`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            locationId,
            filters: [
                {
                    field: 'name',
                    operator: 'contains',
                    value: name,
                },
            ],
            page: 1,
            pageLimit: 5, // Multiple results possible; caller resolves
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GHL] searchContactByName failed: ${response.status}`, errorText);
        throw new Error(`GHL API error: ${response.status}`);
    }

    const data: GHLSearchResult = await response.json();
    return data.contacts.length > 0 ? data.contacts[0] : null;
}

/**
 * Get a contact by ID (full details with custom fields).
 */
export async function getContactById(contactId: string): Promise<GHLContact | null> {
    const response = await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        if (response.status === 404) return null;
        const errorText = await response.text();
        console.error(`[GHL] getContactById failed: ${response.status}`, errorText);
        throw new Error(`GHL API error: ${response.status}`);
    }

    const data = await response.json();
    return data.contact || data;
}

// ─── Contact Update ──────────────────────────────────────────────────

/**
 * Update custom fields on a contact.
 * This is the primary write operation for the nurse voice pipeline (Folder 3).
 * 
 * @param contactId - GHL contact ID
 * @param customFields - Array of { key, field_value } pairs
 */
export async function updateContactFields(
    contactId: string,
    customFields: CustomFieldUpdate[]
): Promise<void> {
    const response = await fetch(`${GHL_BASE_URL}/contacts/${contactId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
            customFields: customFields.map(cf => ({
                key: cf.key,
                field_value: cf.field_value,
            })),
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GHL] updateContactFields failed: ${response.status}`, errorText);
        throw new Error(`GHL API error: ${response.status}`);
    }

    console.log(`[GHL] Updated ${customFields.length} fields on contact ${contactId}`);
}

// ─── Contact Notes (Audit Trail) ─────────────────────────────────────

/**
 * Add a note to a contact's timeline.
 * This creates the immutable historical record (audit trail).
 * Every nurse voice note parse gets appended here.
 */
export async function addContactNote(
    contactId: string,
    body: string
): Promise<GHLNote> {
    const response = await fetch(`${GHL_BASE_URL}/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            body,
            userId: null, // System-generated note
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GHL] addContactNote failed: ${response.status}`, errorText);
        throw new Error(`GHL API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[GHL] Added note to contact ${contactId}`);
    return data.note || data;
}

// ─── Helper: Extract custom field value from contact ─────────────────

/**
 * Extract a specific custom field value from a GHL contact object.
 */
export function getCustomFieldValue(contact: GHLContact, fieldKey: string): string | undefined {
    if (!contact.customFields) return undefined;
    const field = contact.customFields.find(f => f.key === fieldKey);
    return field?.fieldValue || field?.value;
}

// ─── Helper: Format note body for audit trail ────────────────────────

/**
 * Format a structured JSON payload as a readable note for the CRM timeline.
 */
export function formatNoteBody(data: {
    residentName: string;
    medsStatus: string;
    mealsStatus: string;
    vitalsSummary: string;
    generalNotes: string;
    statusFlag: string;
    timestamp: string;
    rawTranscription: string;
}): string {
    return `📋 REGISTRO AUTOMÁTICO — ${data.timestamp}
═══════════════════════════════════════
👤 Residente: ${data.residentName}
🚦 Estado: ${data.statusFlag}

💊 Medicamentos: ${data.medsStatus}
🍽️ Alimentación: ${data.mealsStatus}
🩺 Signos Vitales: ${data.vitalsSummary}

📝 Notas Generales:
${data.generalNotes}

───────────────────────────────────────
🎙️ Transcripción Original:
"${data.rawTranscription}"
───────────────────────────────────────
⚙️ Generado automáticamente por el sistema de IA`;
}
