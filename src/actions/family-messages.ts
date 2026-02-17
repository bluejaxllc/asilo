"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function getMessages(patientId: string) {
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
    const session = await auth();
    if (!session?.user?.id) throw new Error("No autenticado");

    return db.familyMessage.create({
        data: {
            content,
            patientId,
            fromUserId: session.user.id,
            isFromFamily: session.user.role === "FAMILY",
        },
    });
}

export async function getPatientMedications(patientId: string) {
    return db.patientMedication.findMany({
        where: { patientId },
        include: {
            medication: { select: { name: true, unit: true, stock: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}
