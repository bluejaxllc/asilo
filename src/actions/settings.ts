"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const getSettings = async () => {
    try {
        const settings = await db.systemSetting.findMany();
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
        await db.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        revalidatePath("/admin/settings");
        return { success: "Configuración actualizada" };
    } catch (error) {
        console.error("Error updating setting:", error);
        return { error: "Error al actualizar configuración" };
    }
};
