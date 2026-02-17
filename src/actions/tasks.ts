"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const getMyTasks = async (email: string) => {
    try {
        const user = await db.user.findUnique({
            where: { email }
        });

        if (!user) return [];

        return await db.task.findMany({
            where: {
                // Show all for now, or filter by user if strict assignment needed
                // OR: assignedToId: user.id
            },
            include: {
                patient: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
};

export const getAllTasks = async () => {
    // Patient data will be joined on the client side.
    return await db.task.findMany({
        include: {
            patient: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

export const createTask = async (title: string, priority: string, patientId?: string) => {
    try {
        await db.task.create({
            data: {
                title,
                priority,
                patientId: patientId || null,
                status: "PENDING"
            }
        });
        revalidatePath("/admin/tasks");
        revalidatePath("/staff");
        return { success: "Tarea creada exitosamente" };
    } catch (error) {
        return { error: "Error al crear la tarea" };
    }
};

export const deleteTask = async (id: string) => {
    try {
        await db.task.delete({ where: { id } });
        revalidatePath("/admin/tasks");
        revalidatePath("/staff");
        return { success: "Tarea eliminada" };
    } catch (error) {
        return { error: "Error al eliminar la tarea" };
    }
};

export const toggleTaskStatus = async (id: string, currentStatus: boolean) => {
    try {
        await db.task.update({
            where: { id },
            data: { status: currentStatus ? "PENDING" : "COMPLETED" }
        });
        revalidatePath("/admin/tasks");
        return { success: "Estado actualizado" };
    } catch (error) {
        return { error: "Error al actualizar estado" };
    }
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
