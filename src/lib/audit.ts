/**
 * BlueJax / Asilo
 * Audit Trail Utility
 * 
 * Logs sensitive actions (Creates, Updates, Deletes) to the database for Super Admins.
 */

import { db } from "@/lib/db";

export type AuditActionType = "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "LOGIN" | "INVITE";

export const logAction = async (params: {
    userId: string;
    facilityId: string;
    action: AuditActionType;
    entity: string; // The table/model name e.g., 'Patient', 'User', 'Medication'
    entityId?: string; // ID of the specific record modified
    details?: string | any; // JSON object of the changes
}) => {
    try {
        await db.auditLog.create({
            data: {
                userId: params.userId,
                facilityId: params.facilityId,
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                details: params.details ? (typeof params.details === 'string' ? params.details : JSON.stringify(params.details)) : null
            }
        });
    } catch (error) {
        // We log silently so audit errors don't crash the main app flow
        console.error("[AUDIT LOG ERROR]", error);
    }
};
