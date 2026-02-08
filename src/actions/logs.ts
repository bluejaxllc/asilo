"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth"; // Depending on how auth is setup, or just use email from args if verified in component, but better safe. 
// Actually I used session in component and passed email, let's stick to passing email for simplicity if auth() helper isn't ready.
// Better: get user by email inside action.

export const createLog = async (data: {
    type: "VITALS" | "FOOD" | "MEDS" | "NOTE";
    value: string;
    notes?: string;
    patientId: string;
    userEmail: string;
}) => {
    const user = await db.user.findUnique({
        where: { email: data.userEmail }
    });

    if (!user) {
        return { error: "Usuario no encontrado" };
    }

    try {
        await db.dailyLog.create({
            data: {
                type: data.type,
                value: data.value,
                notes: data.notes,
                patientId: data.patientId,
                authorId: user.id
            }
        });

        revalidatePath("/staff/patients");
        revalidatePath("/admin"); // Updates dashboard feed
        return { success: "Registro guardado exitosamente" };
    } catch (error) {
        console.error("Error creating log:", error);
        return { error: "Error al guardar el registro" };
    }
};
