"use server";

import { db } from "@/lib/db";
import { getCurrentFacilityId } from "@/lib/facility";

export async function getIASuggestion(patientId: string) {
    const facilityId = await getCurrentFacilityId();
    if (!facilityId) return { success: false, suggestion: "Error: No autorizado." };

    // In a real scenario, this would send the message history to a LLM provider.
    // We'll mock it based on the patient's context.

    const [patient, lastMessages] = await Promise.all([
        db.patient.findUnique({ where: { id: patientId, facilityId } }),
        db.familyMessage.findMany({
            where: { patientId, patient: { facilityId } },
            orderBy: { createdAt: "desc" },
            take: 3
        })
    ]);

    if (!patient) return { success: false, suggestion: "Error: Residente no encontrado." };

    const lastMsg = lastMessages[0]?.content.toLowerCase() || "";
    let suggestion = "";

    if (lastMsg.includes("como esta") || lastMsg.includes("estado")) {
        suggestion = `Hola, ${patient?.name} se encuentra ${patient?.status.toLowerCase() || "estable"} el día de hoy. Ha participado en sus actividades normales y comido bien.`;
    } else if (lastMsg.includes("medicina") || lastMsg.includes("pastilla")) {
        suggestion = `Hola, confirmamos que ${patient?.name} ha recibido sus medicamentos según el esquema indicado. Cualquier cambio se lo notificaremos de inmediato.`;
    } else if (lastMsg.includes("visita") || lastMsg.includes("ir a ver")) {
        suggestion = `Hola, claro que sí. Recuerde que el horario de visitas es de 10:00 AM a 6:00 PM. ¿A qué hora le gustaría venir?`;
    } else {
        suggestion = `Hola, agradecemos su mensaje. ${patient?.name} se encuentra bien y bajo nuestro cuidado constante. ¿Hay algo específico en lo que podamos ayudarle?`;
    }

    return {
        success: true,
        suggestion: suggestion
    };
}

export async function getAllConversations() {
    const facilityId = await getCurrentFacilityId();
    if (!facilityId) return [];

    const patients = await db.patient.findMany({
        where: {
            facilityId,
            familyMessages: { some: {} }
        },
        include: {
            familyMessages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                include: {
                    fromUser: { select: { name: true, role: true } }
                }
            },
            _count: {
                select: { familyMessages: true }
            }
        },
        orderBy: { updatedAt: "desc" }
    });

    return patients.map(p => ({
        patientId: p.id,
        patientName: p.name,
        room: p.room,
        totalMessages: p._count.familyMessages,
        lastMessage: p.familyMessages[0] ? {
            content: p.familyMessages[0].content,
            isFromFamily: p.familyMessages[0].isFromFamily,
            fromName: p.familyMessages[0].fromUser.name,
            createdAt: p.familyMessages[0].createdAt,
        } : null,
    }));
}

export async function getUnansweredCount() {
    const facilityId = await getCurrentFacilityId();
    if (!facilityId) return 0;

    const patients = await db.patient.findMany({
        where: {
            facilityId,
            familyMessages: { some: {} }
        },
        include: {
            familyMessages: {
                orderBy: { createdAt: "desc" },
                take: 1,
            }
        }
    });

    return patients.filter(p => p.familyMessages[0]?.isFromFamily).length;
}
