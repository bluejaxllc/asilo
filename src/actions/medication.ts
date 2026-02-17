"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const addMedication = async (data: {
    name: string;
    stockLevel: number;
    minStock: number;
    unit: string;
    expiryDate?: string;
}) => {
    try {
        await db.medication.create({
            data: {
                name: data.name,
                stock: data.stockLevel,
                minStock: data.minStock,
                unit: data.unit,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null
            }
        });

        revalidatePath("/admin/inventory");
        return { success: "Medicamento agregado exitosamente" };
    } catch (error) {
        console.error("Error adding medication:", error);
        return { error: "Error al agregar medicamento" };
    }
};

export const getAllMedications = async (query?: string) => {
    try {
        const medications = await db.medication.findMany({
            where: query ? {
                name: { contains: query, mode: 'insensitive' }
            } : undefined,
            orderBy: { name: 'asc' }
        });

        // Calculate status for each medication
        const medicationsWithStatus = medications.map(med => {
            let status = "OK";
            if (med.stock === 0) {
                status = "AGOTADO";
            } else if (med.stock <= med.minStock) {
                status = "BAJO";
            }

            return {
                id: med.id,
                name: med.name,
                stock: med.stock,
                min: med.minStock,
                unit: med.unit,
                status,
                expiryDate: med.expiryDate
            };
        });

        return medicationsWithStatus;
    } catch (error) {
        console.error("Error fetching medications:", error);
        return [];
    }
};

export const logMedicationAdministration = async (patientId: string, medicationName: string, dosage: string) => {
    try {
        await db.dailyLog.create({
            data: {
                patientId,
                authorId: "staff-id-placeholder", // Ideally this comes from session
                type: "MEDS",
                value: `Administró ${medicationName} (${dosage})`,
                notes: `Dosis de ${dosage}`
            }
        });

        revalidatePath(`/admin/patients/${patientId}`);
        return { success: true };
    } catch (error) {
        console.error("Error logging medication:", error);
        return { error: "Error al registrar medicamento" };
    }
};

export const updateMedicationStock = async (id: string, newStock: number) => {
    try {
        await db.medication.update({
            where: { id },
            data: { stock: newStock }
        });

        revalidatePath("/admin/inventory");
        return { success: "Stock actualizado correctamente" };
    } catch (error) {
        console.error("Error updating stock:", error);
        return { error: "Error al actualizar stock" };
    }
};

export const deleteMedication = async (id: string) => {
    try {
        await db.medication.delete({
            where: { id }
        });

        revalidatePath("/admin/inventory");
        return { success: "Medicamento eliminado correctamente" };
    } catch (error) {
        console.error("Error deleting medication:", error);
        return { error: "Error al eliminar medicamento" };
    }
};

export const assignMedication = async (patientId: string, medicationId: string, dosage: string, schedule: string) => {
    try {
        await db.patientMedication.create({
            data: {
                patientId,
                medicationId,
                dosage,
                schedule
            }
        });

        revalidatePath(`/admin/patients/${patientId}`);
        return { success: "Medicamento asignado correctamente" };
    } catch (error) {
        console.error("Error assigning medication:", error);
        return { error: "Error al asignar medicamento" };
    }
};
