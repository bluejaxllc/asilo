"use server";

import { auth } from "@/auth";

/**
 * Returns the facilityId from the current session.
 * Use this in server actions/pages to scope queries by tenant.
 */
export async function getCurrentFacilityId(): Promise<string | null> {
    const session = await auth();
    return (session?.user as any)?.facilityId ?? null;
}
