"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { sendGhlWebhook } from "@/lib/whatsapp";

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

export const getPremiumServices = async () => {
    const session = await auth();
    const user = session?.user;
    if (!user) return [];

    const dbUser = await db.user.findUnique({
        where: { id: user.id },
        include: { patient: true }
    });

    if (!dbUser?.patient?.facilityId) return [];

    const services = await db.premiumService.findMany({
        where: {
            facilityId: dbUser.patient.facilityId,
            isActive: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return services;
};

export const recordPremiumPurchase = async (serviceId: string, notes?: string, frequency: string = "ONCE") => {
    const session = await auth();
    const user = session?.user;
    if (!user) return { error: "No autorizado" };

    const dbUser = await db.user.findUnique({
        where: { id: user.id },
        include: { patient: true }
    });

    if (!dbUser?.patient?.facilityId) {
        return { error: "No tiene un paciente asignado." };
    }

    try {
        const purchase = await db.premiumPurchase.create({
            data: {
                serviceId,
                patientId: dbUser.patient.id,
                familyMemberId: user.id || "unknown_user",
                facilityId: dbUser.patient.facilityId,
                status: "PENDING",
                frequency,
                ...(notes ? { notes } : {})
            }
        });

        // Trigger webhook mapped to GHL
        const service = await db.premiumService.findUnique({ where: { id: serviceId } });
        if (service) {
            const freqLabels: Record<string, string> = {
                ONCE: "Una vez",
                DAILY: "Diario (paquete mensual)",
                WEEKLY: "Semanal (paquete mensual)",
                BIWEEKLY: "Quincenal (paquete mensual)"
            };
            await sendGhlWebhook({
                type: "PREMIUM_PURCHASE",
                patientId: dbUser.patient.id,
                patientName: dbUser.patient.name,
                familyName: user.name || "Familiar",
                details: {
                    serviceName: service.name,
                    price: service.price,
                    frequency: freqLabels[frequency] || frequency,
                    notes: notes || "Ninguna"
                }
            });
        }

        return { success: purchase };
    } catch (error) {
        console.error("Error recording purchase:", error);
        return { error: "Error al procesar la solicitud." };
    }
};

export const getPurchaseHistory = async () => {
    const session = await auth();
    const user = session?.user;
    if (!user) return [];

    const dbUser = await db.user.findUnique({
        where: { id: user.id },
        include: { patient: true }
    });

    if (!dbUser?.patient?.id) return [];

    const purchases = await db.premiumPurchase.findMany({
        where: { patientId: dbUser.patient.id },
        include: {
            service: {
                select: { name: true, price: true, icon: true, category: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    return purchases;
};
