"use server";

import { db } from "@/lib/db";

export async function getAllConversations() {
    // Get all patients that have messages
    const patients = await db.patient.findMany({
        where: {
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
    // Find patient threads where the last message is from family (unanswered)
    const patients = await db.patient.findMany({
        where: {
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
