"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const deletePatient = async (patientId: string) => {
    try {
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
