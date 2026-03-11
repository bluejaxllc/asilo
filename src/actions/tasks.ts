"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentFacilityId } from "@/lib/facility";
import { auth } from "@/auth";

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

export const getMyTasks = async () => {
    try {
        const session = await auth();
        const email = session?.user?.email;

        if (!email) return [];

        const user = await db.user.findUnique({
            where: { email }
        });

        if (!user) return [];

        // Return tasks assigned to this user OR unassigned tasks in their facility
        return await db.task.findMany({
            where: {
                OR: [
                    { assignedToId: user.id },
                    ...(user.facilityId ? [{
                        facilityId: user.facilityId,
                        assignedToId: null,
                        status: { not: "COMPLETED" }
                    }] : [])
                ]
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

// Helper: write a TASK entry to the Bitácora (DailyLog)
async function logTaskAction(
    action: string,
    taskTitle: string,
    userId: string,
    patientId?: string | null
) {
    try {
        await db.dailyLog.create({
            data: {
                type: "TASK",
                value: action,
                notes: taskTitle,
                patientId: patientId || null,
                authorId: userId,
            }
        });
    } catch (err) {
        console.error("[logTaskAction] Error:", err);
    }
}

// Helper: get the current user ID from session
async function getCurrentUserId(): Promise<string | null> {
    try {
        const session = await auth();
        const email = session?.user?.email;
        if (!email) return null;
        const user = await db.user.findUnique({ where: { email }, select: { id: true } });
        return user?.id || null;
    } catch {
        return null;
    }
}

export const createTask = async (
    title: string,
    priority: string,
    patientId?: string,
    assignedToId?: string,
    dueDate?: string,
    recurrence?: string,
    recurrenceEnd?: string
) => {
    try {
        const facilityId = await getCurrentFacilityId();
        if (!facilityId) return { error: "No autorizado" };

        // Ownership checks before creating the task
        if (patientId) {
            const patient = await db.patient.findUnique({ where: { id: patientId, facilityId } });
            if (!patient) return { error: "Paciente no pertenece a esta instalación" };
        }
        if (assignedToId) {
            const assignee = await db.user.findUnique({ where: { id: assignedToId, facilityId } });
            if (!assignee) return { error: "Usuario asignado no pertenece a esta instalación" };
        }

        await db.task.create({
            data: {
                title,
                priority,
                patientId: patientId || null,
                assignedToId: assignedToId || null,
                dueDate: dueDate ? new Date(dueDate) : null,
                recurrence: recurrence || "NONE",
                recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : null,
                status: "PENDING",
                facilityId,
            }
        });

        // Log to Bitácora
        const userId = await getCurrentUserId();
        if (userId) {
            const recLabel = recurrence && recurrence !== "NONE" ? ` (🔁 ${recurrence})` : "";
            await logTaskAction(`Tarea creada${recLabel}`, title, userId, patientId);
        }

        revalidatePath("/admin/tasks");
        revalidatePath("/admin/logs");
        revalidatePath("/staff");
        return { success: "Tarea creada exitosamente" };
    } catch (error) {
        return { error: "Error al crear la tarea" };
    }
};

export const deleteTask = async (id: string) => {
    try {
        const facilityId = await getCurrentFacilityId();
        if (!facilityId) return { error: "No autorizado" };

        const task = await db.task.findUnique({ where: { id } });
        if (!task || task.facilityId !== facilityId) return { error: "Tarea no encontrada o no pertenece a la instalación" };

        await db.task.delete({ where: { id } });

        // Log to Bitácora
        const userId = await getCurrentUserId();
        if (userId) {
            await logTaskAction("Tarea eliminada", task.title, userId, task.patientId);
        }

        revalidatePath("/admin/tasks");
        revalidatePath("/admin/logs");
        revalidatePath("/staff");
        return { success: "Tarea eliminada" };
    } catch (error) {
        return { error: "Error al eliminar la tarea" };
    }
};

export const toggleTaskStatus = async (id: string, currentStatus: boolean) => {
    try {
        const facilityId = await getCurrentFacilityId();
        if (!facilityId) return { error: "No autorizado" };

        const task = await db.task.findUnique({ where: { id } });
        if (!task || task.facilityId !== facilityId) return { error: "Tarea no encontrada o no pertenece a la instalación" };

        const newStatus = currentStatus ? "PENDING" : "COMPLETED";
        await db.task.update({
            where: { id },
            data: { status: newStatus }
        });

        // Log to Bitácora
        const userId = await getCurrentUserId();
        if (userId) {
            const action = newStatus === "COMPLETED" ? "Tarea completada ✅" : "Tarea reabierta";
            await logTaskAction(action, task.title, userId, task.patientId);
        }

        revalidatePath("/admin/tasks");
        revalidatePath("/admin/logs");
        return { success: "Estado actualizado" };
    } catch (error) {
        return { error: "Error al actualizar estado" };
    }
};

export const startTask = async (taskId: string, userEmail: string) => {
    try {
        // Find the user directly by email (no facility compound check)
        const user = await db.user.findUnique({
            where: { email: userEmail }
        });
        if (!user || !user.facilityId) return { error: "Usuario no encontrado" };

        const task = await db.task.findUnique({ where: { id: taskId } });
        if (!task) return { error: "Tarea no encontrada" };

        // If task has no facilityId (legacy data), auto-heal it
        if (!task.facilityId) {
            await db.task.update({
                where: { id: taskId },
                data: { facilityId: user.facilityId }
            });
        } else if (task.facilityId !== user.facilityId) {
            return { error: "Tarea no pertenece a esta instalación" };
        }

        await db.task.update({
            where: { id: taskId },
            data: {
                status: "IN_PROGRESS",
                assignedToId: user.id
            }
        });

        // Log to Bitácora
        await logTaskAction("Tarea iniciada", task.title, user.id, task.patientId);

        revalidatePath("/staff");
        revalidatePath("/admin/logs");
        return { success: "Tarea iniciada" };
    } catch (error) {
        console.error("Error starting task:", error);
        return { error: "Error al iniciar la tarea" };
    }
};

export const completeTask = async (taskId: string) => {
    try {
        const session = await auth();
        const email = session?.user?.email;
        if (!email) return { error: "No autorizado" };

        const user = await db.user.findUnique({
            where: { email }
        });
        if (!user) return { error: "Usuario no encontrado" };

        const task = await db.task.findUnique({ where: { id: taskId } });
        if (!task) return { error: "Tarea no encontrada" };

        // If task has no facilityId (legacy data), auto-heal it
        if (!task.facilityId && user.facilityId) {
            await db.task.update({
                where: { id: taskId },
                data: { facilityId: user.facilityId }
            });
        } else if (task.facilityId && user.facilityId && task.facilityId !== user.facilityId) {
            return { error: "Tarea no pertenece a esta instalación" };
        }

        await db.task.update({
            where: { id: taskId },
            data: {
                status: "COMPLETED"
            }
        });

        // Log to Bitácora
        await logTaskAction("Tarea completada ✅", task.title, user.id, task.patientId);

        revalidatePath("/staff");
        revalidatePath("/admin/logs");
        return { success: "Tarea completada" };
    } catch (error) {
        console.error("Error completing task:", error);
        return { error: "Error al completar la tarea" };
    }
};
