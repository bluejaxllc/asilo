"use server";

import { db } from "@/lib/db";
import { getCurrentFacilityId } from "@/lib/facility";

export async function getNotifications(filter?: string, query?: string) {
    const facilityId = await getCurrentFacilityId();
    const where: any = {
        ...(facilityId ? { facilityId } : { facilityId: "__none__" }),
    };

    if (filter && filter !== "ALL") {
        where.type = filter;
    }

    if (query) {
        where.OR = [
            { title: { contains: query, mode: "insensitive" } },
            { message: { contains: query, mode: "insensitive" } },
        ];
    }

    return db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
    });
}

export async function getUnreadCount() {
    const facilityId = await getCurrentFacilityId();
    return db.notification.count({
        where: {
            read: false,
            ...(facilityId ? { facilityId } : { facilityId: "__none__" }),
        },
    });
}

export async function markAsRead(id: string) {
    try {
        await db.notification.update({
            where: { id },
            data: { read: true },
        });
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { error: "Error al marcar como leída" };
    }
}

export async function markAllAsRead() {
    const facilityId = await getCurrentFacilityId();
    try {
        await db.notification.updateMany({
            where: {
                read: false,
                ...(facilityId ? { facilityId } : { facilityId: "__none__" }),
            },
            data: { read: true },
        });
        return { success: true };
    } catch (error) {
        console.error("Error marking all as read:", error);
        return { error: "Error al marcar todas como leídas" };
    }
}

export async function deleteNotification(id: string) {
    try {
        await db.notification.delete({
            where: { id },
        });
        return { success: true };
    } catch (error) {
        console.error("Error deleting notification:", error);
        return { error: "Error al eliminar notificación" };
    }
}

export async function createNotification(
    title: string,
    message: string,
    type: string = "INFO",
    recipientRole?: string,
    recipientName?: string
) {
    const facilityId = await getCurrentFacilityId();
    return db.notification.create({
        data: {
            title,
            message,
            type,
            ...(facilityId ? { facilityId } : {}),
            ...(recipientRole && recipientRole !== "ALL" ? { recipientRole } : {}),
            ...(recipientName ? { recipientName } : {}),
        },
    });
}
