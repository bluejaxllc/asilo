"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { requireRole } from "@/lib/role-guard";
import { getCurrentFacilityId } from "@/lib/facility";

export const addMedication = async (data: {
    name: string;
    stockLevel: number;
    minStock: number;
    unit: string;
    expiryDate?: string;
}) => {
    const check = await requireRole("ADMIN");
    if ("error" in check) return { error: check.error };

    try {
        const facilityId = await getCurrentFacilityId();
        await db.medication.create({
            data: {
                name: data.name,
                stock: data.stockLevel,
                minStock: data.minStock,
                unit: data.unit,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                facilityId,
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
        const facilityId = await getCurrentFacilityId();
        const facilityFilter = facilityId ? { facilityId } : { facilityId: "__none__" as string };
        const medications = await db.medication.findMany({
            where: {
                ...facilityFilter,
                ...(query ? { name: { contains: query, mode: 'insensitive' as const } } : {})
            },
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
    const check = await requireRole("ADMIN", "DOCTOR", "NURSE", "STAFF");
    if ("error" in check) return { error: check.error };
    const session = check.session;

    try {

        await db.dailyLog.create({
            data: {
                patientId,
                authorId: session.user.id!,
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
