"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Helper to authenticate and verify Super Admin role
 */
async function requireSuperAdmin() {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!session || role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized. Super Admin access required.");
    }
}

/**
 * Get high-level aggregated stats across the entire platform.
 */
export async function getPlatformStats() {
    await requireSuperAdmin();

    const totalFacilities = await db.facility.count();
    const totalUsers = await db.user.count();
    const totalPatients = await db.patient.count();

    // Optionally get revenue or premium plans
    const premiumFacilities = await db.facility.count({
        where: {
            plan: {
                not: "FREE"
            }
        }
    });

    return {
        totalFacilities,
        totalUsers,
        totalPatients,
        premiumFacilities,
    };
}

/**
 * Get a detailed list of all facilities and their usage metrics.
 */
export async function getFacilitiesList() {
    await requireSuperAdmin();

    const facilities = await db.facility.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            _count: {
                select: {
                    users: true,
                    patients: true,
                }
            }
        }
    });

    return facilities;
}

/**
 * Manually update a facility's subscription plan.
 */
export async function updateFacilityPlan(facilityId: string, newPlan: string) {
    await requireSuperAdmin();

    await db.facility.update({
        where: { id: facilityId },
        data: { plan: newPlan }
    });

    revalidatePath("/super-admin");
    return { success: true };
}

/**
 * Hard delete a facility and cascade delete its users/patients.
 * (Prisma relations might require careful cascade config, assuming schema is set up)
 */
export async function deleteFacility(facilityId: string) {
    await requireSuperAdmin();

    // Since onDelete Cascade might not be fully configured for everything in our quick schema
    // We should safely delete related entities or rely on Prisma.
    // For now, let's just delete the facility if relations allow, or mark it inactive.
    // Given the current schema, if we attempt to delete and it fails due to FK, we'll return an error.

    try {
        await db.facility.delete({
            where: { id: facilityId }
        });
        revalidatePath("/super-admin");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete facility (likely due to foreign key constraints):", error);
        throw new Error("Failed to delete facility. Ensure all related records are deleted or CASCADE is configured in Prisma.");
    }
}
