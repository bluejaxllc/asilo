"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getCurrentFacilityId } from "@/lib/facility";

async function verifyAccess(patientId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("No autenticado");

    if (session.user.role === "FAMILY") {
        const user = await db.user.findUnique({ where: { id: session.user.id } });
        if (user?.patientId !== patientId) throw new Error("No autorizado");
    } else {
        const facilityId = await getCurrentFacilityId();
        if (!facilityId) throw new Error("No autorizado");
        const patient = await db.patient.findUnique({ where: { id: patientId, facilityId } });
        if (!patient) throw new Error("No autorizado");
    }
    return session;
}

export async function getMessages(patientId: string) {
    await verifyAccess(patientId);
    return db.familyMessage.findMany({
        where: { patientId },
        include: {
            fromUser: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 100,
    });
}

export async function sendMessage(patientId: string, content: string) {
    const session = await verifyAccess(patientId);

    return db.familyMessage.create({
        data: {
            content,
            patientId,
            fromUserId: session.user?.id as string,
            isFromFamily: session.user?.role === "FAMILY",
        },
    });
}

export async function getPatientMedications(patientId: string) {
    await verifyAccess(patientId);
    return db.patientMedication.findMany({
        where: { patientId },
        include: {
            medication: { select: { name: true, unit: true, stock: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}
