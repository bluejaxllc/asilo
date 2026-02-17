"use server";

import { db } from "@/lib/db";

export async function getNotifications(filter?: string, query?: string) {
    const where: any = {};

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
    return db.notification.count({
        where: { read: false },
    });
}

export async function markAsRead(id: string) {
    await db.notification.update({
        where: { id },
        data: { read: true },
    });
    return { success: true };
}

export async function markAllAsRead() {
    await db.notification.updateMany({
        where: { read: false },
        data: { read: true },
    });
    return { success: true };
}

export async function deleteNotification(id: string) {
    await db.notification.delete({
        where: { id },
    });
    return { success: true };
}

export async function createNotification(
    title: string,
    message: string,
    type: string = "INFO"
) {
    return db.notification.create({
        data: { title, message, type },
    });
}
