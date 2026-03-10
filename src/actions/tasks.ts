"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentFacilityId } from "@/lib/facility";

export const getStaffList = async () => {
    const facilityId = await getCurrentFacilityId();
    return await db.user.findMany({
        where: {
            ...(facilityId ? { facilityId } : { facilityId: "__none__" }),
            role: { notIn: ["ADMIN", "FAMILY"] }
        },
        select: { id: true, name: true, role: true },
        orderBy: { name: 'asc' }
    });
};

export const getMyTasks = async (email: string) => {
    try {
        const user = await db.user.findUnique({
            where: { email }
        });

        if (!user) return [];

        return await db.task.findMany({
            where: {
                assignedToId: user.id
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
    const facilityId = await getCurrentFacilityId();
    return await db.task.findMany({
        where: facilityId ? { facilityId } : { facilityId: "__none__" },
        include: {
            patient: true,
            assignedTo: {
                select: { name: true, role: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

export const createTask = async (
    title: string,
    priority: string,
    patientId?: string,
    assignedToId?: string,
    dueDate?: string
) => {
    try {
        const facilityId = await getCurrentFacilityId();
        await db.task.create({
            data: {
                title,
                priority,
                patientId: patientId || null,
                assignedToId: assignedToId || null,
                dueDate: dueDate ? new Date(dueDate) : null,
                status: "PENDING",
                facilityId,
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
    try {
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
    } catch (error) {
        console.error("Error starting task:", error);
        return { error: "Error al iniciar la tarea" };
    }
};

export const completeTask = async (taskId: string) => {
    try {
        await db.task.update({
            where: { id: taskId },
            data: {
                status: "COMPLETED"
            }
        });

        revalidatePath("/staff");
        return { success: "Tarea completada" };
    } catch (error) {
        console.error("Error completing task:", error);
        return { error: "Error al completar la tarea" };
    }
};
