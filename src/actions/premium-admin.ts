"use server";

import { db } from "@/lib/db";
import { getCurrentFacilityId } from "@/lib/facility";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";

const DEFAULT_EXPERIENCES = [
    { name: "Peluquería y Barbería a Domicilio", description: "Corte de cabello, arreglo de barba y peinado en la comodidad de la habitación.", price: 350, icon: "Scissors" },
    { name: "Fisioterapia Premium 1:1", description: "Sesión privada de 45 min enfocada en rehabilitación motriz y prevención integral.", price: 600, icon: "Activity" },
    { name: "Escolta para Citas Médicas", description: "Acompañamiento VIP con transporte privado ida y vuelta a citas externas.", price: 800, icon: "Car" },
    { name: "Masaje Terapéutico Relajante", description: "Masaje de cuerpo entero para mejorar la circulación y aliviar tensiones (50 min).", price: 750, icon: "HeartHandshake" },
    { name: "Cena Gourmet de Cumpleaños", description: "Banquete privado para el residente y hasta 3 invitados con menú a 3 tiempos.", price: 1500, icon: "Cake" },
    { name: "Musicoterapia Personalizada", description: "Sesión 1 a 1 de estimulación cognitiva mediante música de su época favorita.", price: 450, icon: "Music" },
    { name: "Podología Clínica y Spa", description: "Atención especializada de pie diabético, corte preventivo y masaje de pies.", price: 500, icon: "Footprints" },
    { name: "Arteterapia Individual", description: "Materiales y guía personalizada en pintura o manualidades para estimulación.", price: 400, icon: "Palette" },
    { name: "Spa de Manicura y Pedicura", description: "Cuidado completo de uñas, esmaltado y crema hidratante especial.", price: 450, icon: "Sparkles" },
    { name: "Conexión Familiar Virtual VIP", description: "Asistencia técnica dedicada (iPad/TV) durante 1 hora para videollamada familiar.", price: 200, icon: "Video" },
    { name: "Paseo Guiado de Fin de Semana", description: "Ruta segura en silla de ruedas o caminando por parques aledaños (1h).", price: 300, icon: "Sun" },
    { name: "Cuidador Nocturno Exclusivo", description: "Vigilancia y asistencia personal 1 a 1 dedicada durante toda la noche (10pm-6am).", price: 1200, icon: "Moon" }
];

export async function getAdminPremiumServices() {
    const facilityId = await getCurrentFacilityId();
    if (!facilityId) return [];

    return await db.premiumService.findMany({
        where: { facilityId },
        orderBy: { createdAt: "desc" }
    });
}

export async function createPremiumService(data: { name: string; description?: string; category?: string; price: number; priceDaily?: number | null; priceWeekly?: number | null; priceBiweekly?: number | null; paymentUrl?: string; icon?: string; isActive?: boolean }) {
    const facilityId = await getCurrentFacilityId();
    if (!facilityId) throw new Error("No facility found");

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const service = await db.premiumService.create({
        data: {
            ...data,
            facilityId
        }
    });

    await logAction({ userId, facilityId, action: "CREATE", entity: "PremiumService", entityId: service.id, details: { name: service.name } });
    revalidatePath("/admin/experiences");
    revalidatePath("/family");
    return { success: true, service };
}

export async function updatePremiumService(id: string, data: { name?: string; description?: string; category?: string; price?: number; priceDaily?: number | null; priceWeekly?: number | null; priceBiweekly?: number | null; paymentUrl?: string; icon?: string; isActive?: boolean }) {
    const facilityId = await getCurrentFacilityId();
    if (!facilityId) throw new Error("No facility found");

    // Verify ownership
    const existing = await db.premiumService.findUnique({ where: { id } });
    if (!existing || existing.facilityId !== facilityId) throw new Error("Service not found or unauthorized");

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const service = await db.premiumService.update({
        where: { id },
        data
    });

    await logAction({ userId, facilityId, action: "UPDATE", entity: "PremiumService", entityId: service.id, details: { changes: Object.keys(data) } });
    revalidatePath("/admin/experiences");
    revalidatePath("/family");
    return { success: true, service };
}

export async function deletePremiumService(id: string) {
    const facilityId = await getCurrentFacilityId();
    if (!facilityId) throw new Error("No facility found");

    const session = await auth();
    const userId = session?.user?.id || 'system';

    // Check if it has purchases
    const purchases = await db.premiumPurchase.count({ where: { serviceId: id } });
    if (purchases > 0) {
        // Soft delete/deactivate if it has history
        await db.premiumService.update({
            where: { id },
            data: { isActive: false }
        });
        await logAction({ userId, facilityId, action: "UPDATE", entity: "PremiumService", entityId: id, details: { status: "Deactivated due to history" } });
        return { success: true, action: "deactivated" };
    }

    const existing = await db.premiumService.findUnique({ where: { id } });
    if (existing?.facilityId === facilityId) {
        await db.premiumService.delete({ where: { id } });
        await logAction({ userId, facilityId, action: "DELETE", entity: "PremiumService", entityId: id, details: { name: existing.name } });
    }
    revalidatePath("/admin/experiences");
    revalidatePath("/family");
    return { success: true, action: "deleted" };
}

export async function seedPremiumServices() {
    const facilityId = await getCurrentFacilityId();
    if (!facilityId) return { success: false, message: "No facility found" };

    const currentCount = await db.premiumService.count({ where: { facilityId } });
    if (currentCount > 0) return { success: true, message: "Already seeded", count: 0 };

    let count = 0;
    for (const exp of DEFAULT_EXPERIENCES) {
        await db.premiumService.create({
            data: {
                ...exp,
                facilityId,
                isActive: true
            }
        });
        count++;
    }

    revalidatePath("/admin/experiences");
    revalidatePath("/family");
    return { success: true, message: `Seeded ${count} experiences`, count };
}
