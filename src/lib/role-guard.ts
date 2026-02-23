"use server";

import { auth } from "@/auth";

export type AppRole = "ADMIN" | "STAFF" | "DOCTOR" | "NURSE" | "KITCHEN" | "FAMILY";

/**
 * Verify the current session user has one of the allowed roles.
 * Returns the session on success, or an error string.
 */
export const requireRole = async (...allowedRoles: AppRole[]) => {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "No autorizado — inicie sesión" };
    }

    const userRole = (session.user as any).role as AppRole;

    if (!allowedRoles.includes(userRole) && !allowedRoles.includes("ADMIN" as AppRole)) {
        // ADMIN always has access unless explicitly excluded
        if (userRole !== "ADMIN") {
            return { error: `No tiene permisos para esta acción (rol: ${userRole})` };
        }
    }

    return { session, role: userRole };
};
