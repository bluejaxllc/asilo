"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const getMyTasks = async (email: string) => {
    const user = await db.user.findUnique({
        where: { email }
    });

    if (!user) return [];

    // For now, fetch ALL pending/in-progress tasks to simulate a pool, 
    // or filter by assignedToId if you strictly want assigned tasks.
    // In this MVP, we might show all tasks created for today.

    return await db.task.findMany({
        where: {
            // status: { not: "COMPLETED" } 
            // Simplified: Show all for demo
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

export const startTask = async (taskId: string, userEmail: string) => {
    const user = await db.user.findUnique({ where: { email: userEmail } });
    if (!user) return { error: "Usuario no encontrado" };

    await db.task.update({
        where: { id: taskId },
        data: {
            status: "IN_PROGRESS",
            assignedToId: user.id
        }
    });

    revalidatePath("/staff");
    return { success: "Tarea iniciada" };
};

export const completeTask = async (taskId: string) => {
    await db.task.update({
        where: { id: taskId },
        data: {
            status: "COMPLETED"
        }
    });

    revalidatePath("/staff");
    return { success: "Tarea completada" };
};
