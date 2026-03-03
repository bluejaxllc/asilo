"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentFacilityId } from "@/lib/facility";

export const getSettings = async () => {
    try {
        const facilityId = await getCurrentFacilityId();
        const settings = await db.facilitySetting.findMany({
            where: { facilityId },
        });
        // Convert array to object for easier consumption
        return settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return {};
    }
};

export const updateSetting = async (key: string, value: string) => {
    try {
        const facilityId = await getCurrentFacilityId();

        // Find existing setting for this facility+key
        const existing = await db.facilitySetting.findFirst({
            where: { facilityId, key },
        });

        if (existing) {
            await db.facilitySetting.update({
                where: { id: existing.id },
                data: { value },
            });
        } else {
            await db.facilitySetting.create({
                data: { key, value, facilityId },
            });
        }

        revalidatePath("/admin/settings");
        return { success: "Configuración actualizada" };
    } catch (error) {
        console.error("Error updating setting:", error);
        return { error: "Error al actualizar configuración" };
    }
};
