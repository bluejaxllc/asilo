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

export const getAllMedications = async () => {
    try {
        const medications = await db.medication.findMany({
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
