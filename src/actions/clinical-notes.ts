"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/role-guard";

export const addClinicalNote = async (patientId: string, content: string) => {
    const check = await requireRole("ADMIN", "DOCTOR", "NURSE");
    if ("error" in check) return { error: check.error };
    const session = check.session;

    if (!content || !content.trim()) {
        return { error: "El contenido de la nota no puede estar vacío" };
    }

    try {
        const user = await db.user.findUnique({ where: { id: session.user.id! } });
        const facilityId = user?.facilityId;

        const patient = await db.patient.findUnique({ where: { id: patientId, facilityId } });
        if (!patient) return { error: "El paciente no pertenece a tu instalación" };

        await db.dailyLog.create({
            data: {
                type: "NOTE",
                value: content, // Storing note content in 'value' as planned
                patientId,
                authorId: session.user.id!
            }
        });

        revalidatePath(`/admin/patients/${patientId}`);
        return { success: "Nota agregada exitosamente" };
    } catch (error) {
        console.error("Error adding clinical note:", error);
        return { error: "Error al guardar la nota" };
    }
};
