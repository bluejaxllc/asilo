"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export const addClinicalNote = async (patientId: string, content: string) => {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "No autorizado" };
    }

    if (!content || !content.trim()) {
        return { error: "El contenido de la nota no puede estar vacío" };
    }

    try {
        await db.dailyLog.create({
            data: {
                type: "NOTE",
                value: content, // Storing note content in 'value' as planned
                patientId,
                authorId: session.user.id
            }
        });

        revalidatePath(`/admin/patients/${patientId}`);
        return { success: "Nota agregada exitosamente" };
    } catch (error) {
        console.error("Error adding clinical note:", error);
        return { error: "Error al guardar la nota" };
    }
};
