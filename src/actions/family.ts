"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export const getFamilyPatient = async () => {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
        return { error: "No autorizado" };
    }

    // Double check database to get the latest patientId
    const dbUser = await db.user.findUnique({
        where: { id: user.id },
        include: { patient: true }
    });

    if (!dbUser?.patient) {
        return { error: "No tiene un familiar asignado." };
    }

    return { success: dbUser.patient };
};

export const getPatientActivity = async (patientId: string) => {
    // Basic security check: ensure the requesting user is actually linked to this patient or is staff
    const session = await auth();
    const user = session?.user;
    if (!user) return [];

    // If user is FAMILY, they must match the patientId
    const dbUser = await db.user.findUnique({
        where: { id: user.id }
    });

    if (dbUser?.role === 'FAMILY' && dbUser.patientId !== patientId) {
        return []; // Unauthorized
    }

    const logs = await db.dailyLog.findMany({
        where: {
            patientId: patientId,
            // Filter out internal/private notes if needed. For MVP, showing all "VITALS" and "FOOD".
            type: { in: ['VITALS', 'FOOD', 'ACTIVITY', 'MEDS'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
            author: {
                select: { name: true, role: true }
            }
        }
    });

    return logs;
};
