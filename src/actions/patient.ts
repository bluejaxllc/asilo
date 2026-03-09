"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/role-guard";
import { revalidatePath } from "next/cache";

export const deletePatient = async (patientId: string) => {
    try {
        const check = await requireRole("ADMIN");
        if ("error" in check) return { error: check.error };
        const session = check.session;
        const user = session.user as any;

        if (!user.facilityId) return { error: "No autorizado" };

        const patient = await db.patient.findUnique({ where: { id: patientId } });
        if (!patient || patient.facilityId !== user.facilityId) {
            return { error: "Paciente no encontrado o no pertenece a su instalación" };
        }

        // Delete patient (this will cascade delete related records based on schema)
        await db.patient.delete({
            where: { id: patientId }
        });

        revalidatePath("/admin/patients");
        revalidatePath("/staff/patients");
        return { success: "Residente eliminado correctamente" };
    } catch (error) {
        console.error("Error deleting patient:", error);
        return { error: "Error al eliminar residente" };
    }
};
