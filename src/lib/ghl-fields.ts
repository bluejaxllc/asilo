/**
 * GHL Custom Field Key Mapping
 * 
 * Maps human-readable field names to their GHL internal fieldKey identifiers.
 * These keys are used when updating contact custom fields via the GHL API.
 * 
 * IMPORTANT: After creating the custom fields in BlueJax admin,
 * replace the placeholder values below with the actual fieldKey values
 * from GHL (Settings → Custom Fields → click field → copy key).
 */

// ─── Folder 1: Resident Core Identity ────────────────────────────────
export const RESIDENT_CORE = {
    RESIDENT_ID: 'contact.resident_id',
    ROOM_NUMBER: 'contact.room_number',
    CARE_LEVEL: 'contact.care_level',
    ALLERGIES_CRITICAL: 'contact.allergies_critical',
} as const;

// ─── Folder 2: Guardian & Access Control ──────────────────────────────
export const GUARDIAN_ACCESS = {
    AUTHORIZED_FAMILY_NAME: 'contact.authorized_family_name',
    AUTHORIZED_WHATSAPP_NUMBER: 'contact.authorized_whatsapp_number',
    FINANCIAL_SPONSOR_EMAIL: 'contact.financial_sponsor_email',
} as const;

// ─── Folder 3: Real-Time AI State ────────────────────────────────────
export const REALTIME_STATE = {
    LAST_UPDATE_TIMESTAMP: 'contact.last_update_timestamp',
    STATUS_FLAG: 'contact.status_flag',
    TODAY_MEDS_STATUS: 'contact.today_meds_status',
    TODAY_MEALS_STATUS: 'contact.today_meals_status',
    TODAY_VITALS_SUMMARY: 'contact.today_vitals_summary',
    TODAY_GENERAL_NOTES: 'contact.today_general_notes',
} as const;

// ─── Folder 4: Cashflow Engine ───────────────────────────────────────
export const CASHFLOW = {
    BASE_MONTHLY_FEE_MXN: 'contact.base_monthly_fee_mxn',
    CURRENT_MONTH_EXTRAS_MXN: 'contact.current_month_extras_mxn',
    NEXT_INVOICE_DATE: 'contact.next_invoice_date',
} as const;

// ─── Combined map for easy iteration ─────────────────────────────────
export const GHL_FIELDS = {
    ...RESIDENT_CORE,
    ...GUARDIAN_ACCESS,
    ...REALTIME_STATE,
    ...CASHFLOW,
} as const;

// ─── Status Flag values (dropdown options) ───────────────────────────
export const STATUS_FLAGS = {
    NORMAL: 'Normal',
    ATTENTION_NEEDED: 'Attention Needed',
    CRITICAL: 'Critical',
} as const;

// ─── Care Level values (dropdown options) ────────────────────────────
export const CARE_LEVELS = {
    INDEPENDENT: 'Independent',
    ASSISTED_LIVING: 'Assisted Living',
    MEMORY_CARE: 'Memory Care/Alzheimer\'s',
} as const;

export type StatusFlag = typeof STATUS_FLAGS[keyof typeof STATUS_FLAGS];
export type CareLevel = typeof CARE_LEVELS[keyof typeof CARE_LEVELS];
